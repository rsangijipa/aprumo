/**
 * Lado do JOGO (dentro do iframe). O jogo não guarda fila própria: entrega cada evento
 * ao hospedeiro, que grava na outbox cifrada e só então responde EVENT_ACK (corrige a lacuna L3).
 * Até o ACK, o evento é reenviado periodicamente (idempotente por eventId).
 */
import {
  MESSAGE_CHANNEL,
  PROTOCOL_VERSION,
  type EventPayload,
  type EventType,
  type GameToHost,
  type HostToGame,
  type SessionConfig,
} from '@aprumo/protocol';

type Command = Exclude<HostToGame, { kind: 'SESSION_CONFIG' } | { kind: 'EVENT_ACK' }>;

/** Payload de TRIAL_COMPLETED com `detail` opcional (o protocolo preenche `{}`). */
export type ResponseRecordedInput = Omit<EventPayload<'TRIAL_COMPLETED'>, 'detail'> & {
  detail?: Record<string, unknown>;
};

/**
 * Atalhos do ciclo universal do runtime (ver RUNTIME_CYCLE em @aprumo/protocol).
 * Todos retornam o eventId e equivalem a `emit(<EVENTO>, payload)`.
 */
export interface RuntimeHelpers {
  gameStarted(configVersion: string): string;
  levelStarted(p: EventPayload<'LEVEL_STARTED'>): string;
  trialStarted(p: EventPayload<'TRIAL_STARTED'>): string;
  stimulusPresented(p: EventPayload<'STIMULUS_PRESENTED'>): string;
  /** Registra dica apresentada (evento PROMPT_USED). */
  promptPresented(p: EventPayload<'PROMPT_USED'>): string;
  responseStarted(p: EventPayload<'RESPONSE_STARTED'>): string;
  /** Registra a resposta pontuada (evento TRIAL_COMPLETED). */
  responseRecorded(p: ResponseRecordedInput): string;
  reinforcerPresented(p: EventPayload<'REINFORCER_PRESENTED'>): string;
  levelCompleted(p: EventPayload<'LEVEL_COMPLETED'>): string;
  gameCompleted(trialsCompleted: number): string;
  paused(reason?: string | null): string;
  resumed(): string;
  /** Saída do jogo (APP_CLOSED). */
  exited(reason: 'adult_exit' | 'timeout' | 'completed' | (string & {})): string;
}

export interface GameClient extends RuntimeHelpers {
  emit<T extends EventType>(type: T, payload: EventPayload<T>): string;
  onConfig(cb: (c: SessionConfig) => void): () => void;
  onCommand(cb: (c: Command) => void): () => void;
  pendingCount(): number;
  /** Liga o ouvinte e anuncia APP_READY. Idempotente (seguro no StrictMode). */
  connect(): void;
  disconnect(): void;
  dispose(): void;
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export function createGameClient(opts: { appId: string; appVersion: string; target?: Window }): GameClient {
  const target = opts.target ?? window.parent;
  const origin = window.location.origin;
  let config: SessionConfig | null = null;
  let sequence = 0;
  const pending = new Map<string, GameToHost>();
  const configCbs = new Set<(c: SessionConfig) => void>();
  const commandCbs = new Set<(c: Command) => void>();

  const post = (msg: GameToHost) => target.postMessage({ channel: MESSAGE_CHANNEL, msg }, origin);

  const onMessage = (e: MessageEvent) => {
    if (e.source !== target || e.origin !== origin) return;
    const data = e.data as { channel?: string; msg?: HostToGame };
    if (data?.channel !== MESSAGE_CHANNEL || !data.msg) return;
    const msg = data.msg;
    if (msg.kind === 'SESSION_CONFIG') {
      config = msg.config;
      configCbs.forEach((cb) => cb(msg.config));
    } else if (msg.kind === 'EVENT_ACK') {
      pending.delete(msg.eventId);
    } else {
      commandCbs.forEach((cb) => cb(msg));
    }
  };
  let resend: number | null = null;
  const connect = () => {
    if (resend != null) return;
    window.addEventListener('message', onMessage);
    resend = window.setInterval(() => pending.forEach(post), 3000);
    post({ kind: 'APP_READY', appId: opts.appId, appVersion: opts.appVersion, protocolVersion: PROTOCOL_VERSION });
  };
  const disconnect = () => {
    if (resend == null) return;
    window.clearInterval(resend);
    resend = null;
    window.removeEventListener('message', onMessage);
  };

  const client: Omit<GameClient, keyof RuntimeHelpers> = {
    emit(type, payload) {
      if (!config) throw new Error('SESSION_CONFIG not received yet');
      const eventId = uid();
      const msg: GameToHost = {
        kind: 'EVENT',
        event: {
          eventId,
          sequence: sequence++,
          runId: config.runId,
          protocolVersion: PROTOCOL_VERSION,
          appId: opts.appId,
          type,
          occurredAt: new Date().toISOString(),
          payload,
        } as GameToHost extends { event: infer E } ? E : never,
      };
      pending.set(eventId, msg);
      post(msg);
      return eventId;
    },
    onConfig(cb) {
      configCbs.add(cb);
      if (config) cb(config);
      return () => configCbs.delete(cb);
    },
    onCommand(cb) {
      commandCbs.add(cb);
      return () => commandCbs.delete(cb);
    },
    pendingCount: () => pending.size,
    connect,
    disconnect,
    dispose: disconnect,
  };
  return { ...client, ...runtimeHelpers(client.emit) };
}

/** Constrói os atalhos do runtime sobre qualquer `emit` (útil para clientes de teste). */
export function runtimeHelpers(emit: GameClient['emit']): RuntimeHelpers {
  return {
    gameStarted: (configVersion) => emit('SESSION_STARTED', { configVersion }),
    levelStarted: (p) => emit('LEVEL_STARTED', p),
    trialStarted: (p) => emit('TRIAL_STARTED', p),
    stimulusPresented: (p) => emit('STIMULUS_PRESENTED', p),
    promptPresented: (p) => emit('PROMPT_USED', p),
    responseStarted: (p) => emit('RESPONSE_STARTED', p),
    responseRecorded: (p) => emit('TRIAL_COMPLETED', { ...p, detail: p.detail ?? {} }),
    reinforcerPresented: (p) => emit('REINFORCER_PRESENTED', p),
    levelCompleted: (p) => emit('LEVEL_COMPLETED', p),
    gameCompleted: (trialsCompleted) => emit('SESSION_COMPLETED', { trialsCompleted }),
    paused: (reason = null) => emit('SESSION_PAUSED', { reason }),
    resumed: () => emit('SESSION_RESUMED', {}),
    exited: (reason) => emit('APP_CLOSED', { reason }),
  };
}
