/**
 * Lado do HOSPEDEIRO (plataforma). Valida origem + source da mensagem, valida o evento contra
 * o protocolo, persiste (outbox) e só então confirma ao jogo. Evento inválido vai para a quarentena.
 */
import {
  MESSAGE_CHANNEL,
  validateEvent,
  type EventEnvelope,
  type GameToHost,
  type HostToGame,
  type SessionConfig,
} from '@aprumo/protocol';

export interface HostOptions {
  frame: HTMLIFrameElement;
  expectedOrigin: string;
  config: SessionConfig;
  /** Deve resolver só depois de gravar o evento na outbox. */
  persist: (event: EventEnvelope) => Promise<void>;
  quarantine: (raw: unknown, reason: string) => void;
  onEvent?: (event: EventEnvelope) => void;
  onReady?: () => void;
}

export interface GameHost {
  send(msg: HostToGame): void;
  dispose(): void;
}

export function attachGameHost(o: HostOptions): GameHost {
  const seen = new Set<string>();
  const send = (msg: HostToGame) =>
    o.frame.contentWindow?.postMessage({ channel: MESSAGE_CHANNEL, msg }, o.expectedOrigin);

  const onMessage = async (e: MessageEvent) => {
    if (e.source !== o.frame.contentWindow || e.origin !== o.expectedOrigin) return;
    const data = e.data as { channel?: string; msg?: GameToHost };
    if (data?.channel !== MESSAGE_CHANNEL || !data.msg) return;
    const msg = data.msg;

    if (msg.kind === 'APP_READY') {
      if (msg.appId !== o.config.appId) {
        o.quarantine(msg, `app mismatch: ${msg.appId}`);
        return;
      }
      send({ kind: 'SESSION_CONFIG', config: o.config });
      o.onReady?.();
      return;
    }

    if (msg.kind === 'EVENT') {
      const result = validateEvent(msg.event);
      if (!result.ok) {
        o.quarantine(msg.event, result.reason);
        // ACK mesmo assim: o evento foi recebido e encaminhado; reenviar não o tornaria válido.
        const id = (msg.event as { eventId?: string })?.eventId;
        if (id) send({ kind: 'EVENT_ACK', eventId: id });
        return;
      }
      const ev = result.event;
      if (ev.runId !== o.config.runId || ev.appId !== o.config.appId) {
        o.quarantine(ev, 'run/app mismatch');
        send({ kind: 'EVENT_ACK', eventId: ev.eventId });
        return;
      }
      if (!seen.has(ev.eventId)) {
        await o.persist(ev);
        seen.add(ev.eventId);
        o.onEvent?.(ev);
      }
      send({ kind: 'EVENT_ACK', eventId: ev.eventId });
    }
  };

  window.addEventListener('message', onMessage);
  return { send, dispose: () => window.removeEventListener('message', onMessage) };
}
