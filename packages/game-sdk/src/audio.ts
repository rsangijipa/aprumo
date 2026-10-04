/**
 * Paleta sonora procedural (Web Audio, sem arquivos, sem flashes sonoros). Volume segue a adaptação.
 * - AudioContext criado de forma preguiçosa (no primeiro som ou no primeiro gesto do usuário).
 * - Envoltórias ADSR suaves e ganho baixo; nenhum som de "erro" áspero (no máximo o cue neutro 'retry').
 * - Mute global interrompe imediatamente tudo o que estiver tocando (inclusive a fala).
 */

/** Nível de som da adaptação clínica (protocolo atual). */
export type SoundLevel = 'off' | 'low' | 'normal';
/** Modo de som do runtime: 'effects' = só efeitos (sem fala), 'full' = efeitos + fala. */
export type SoundMode = 'off' | 'effects' | 'full';
/** Qualquer configuração aceita pelo motor de áudio. */
export type SoundSetting = SoundLevel | SoundMode;

const GAIN: Record<SoundSetting, number> = { off: 0, low: 0.06, normal: 0.14, effects: 0.08, full: 0.12 };

/** Ganho de pico para a configuração (0 quando desligado ou em mute). */
export function soundGain(setting: SoundSetting): number {
  return muted ? 0 : GAIN[setting] ?? 0;
}
/** Efeitos sonoros (cues/tons) permitidos? */
export function allowsEffects(setting: SoundSetting): boolean {
  return !muted && setting !== 'off';
}
/** Fala (Web Speech) permitida? 'effects' bloqueia a fala; 'low'/'normal'/'full' permitem. */
export function allowsSpeech(setting: SoundSetting): boolean {
  return !muted && setting !== 'off' && setting !== 'effects';
}

/* ------------------------------------------------------------ contexto */

type Ctor = new () => AudioContext;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const voices = new Set<AudioScheduledSourceNode>();

function audioCtor(): Ctor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const C = audioCtor();
  if (!C) return null;
  ctx = new C();
  master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  return ctx;
}

/** Cria/retoma o AudioContext. Chame dentro de um gesto do usuário (toque, tecla). */
export function unlockAudio(): void {
  if (muted) return;
  const c = getCtx();
  if (c && c.state === 'suspended') void c.resume();
}

/** Liga o desbloqueio no primeiro gesto (pointerdown/keydown/touchstart). Retorna a função de limpeza. */
export function installAudioUnlock(target: Pick<Window, 'addEventListener' | 'removeEventListener'> = window): () => void {
  const events = ['pointerdown', 'keydown', 'touchstart'] as const;
  const handler = () => {
    unlockAudio();
    off();
  };
  const off = () => events.forEach((e) => target.removeEventListener(e, handler, true));
  events.forEach((e) => target.addEventListener(e, handler, true));
  return off;
}

/* ------------------------------------------------------------ mute global */

let muted = false;
const muteCbs = new Set<(m: boolean) => void>();

/** Para imediatamente todos os sons em curso (sem alterar o estado de mute). */
export function stopAllSounds(): void {
  for (const v of voices) {
    try {
      v.stop();
    } catch {
      /* já parado */
    }
  }
  voices.clear();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function setMuted(value: boolean): void {
  if (muted === value) return;
  muted = value;
  if (ctx && master) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(value ? 0 : 1, now);
  }
  if (value) stopAllSounds();
  muteCbs.forEach((cb) => cb(value));
}
export const isMuted = () => muted;
export const toggleMute = () => setMuted(!muted);
export function onMuteChange(cb: (m: boolean) => void): () => void {
  muteCbs.add(cb);
  return () => muteCbs.delete(cb);
}

/* ------------------------------------------------------------ síntese */

export interface Tone {
  freq: number;
  /** Duração da sustentação (s). Sem ADSR explícito, é o tempo total do decaimento (legado). */
  dur: number;
  type?: OscillatorType;
  delay?: number;
  slideTo?: number;
  /** ADSR (s / razão). Quando qualquer um é informado, usa a envoltória ADSR completa. */
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  /** Multiplicador de volume relativo (0–1). */
  gain?: number;
}

function track(src: AudioScheduledSourceNode) {
  voices.add(src);
  src.onended = () => voices.delete(src);
}

function envelope(g: GainNode, t: Tone, start: number, peak: number): number {
  const p = Math.max(0.0001, peak);
  const isAdsr = t.attack != null || t.decay != null || t.sustain != null || t.release != null;
  g.gain.setValueAtTime(0, start);
  if (!isAdsr) {
    g.gain.linearRampToValueAtTime(p, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
    return start + t.dur;
  }
  const a = t.attack ?? 0.012;
  const d = t.decay ?? 0.06;
  const s = Math.max(0.0001, p * (t.sustain ?? 0.6));
  const r = t.release ?? 0.12;
  g.gain.linearRampToValueAtTime(p, start + a);
  g.gain.exponentialRampToValueAtTime(s, start + a + d);
  const holdEnd = Math.max(start + a + d, start + t.dur);
  g.gain.setValueAtTime(s, holdEnd);
  g.gain.exponentialRampToValueAtTime(0.0001, holdEnd + r);
  return holdEnd + r;
}

export function playTones(tones: Tone[], level: SoundSetting): void {
  if (!allowsEffects(level)) return;
  const c = getCtx();
  if (!c || !master) return;
  if (c.state === 'suspended') void c.resume();
  const now = c.currentTime;
  const base = GAIN[level] ?? 0;
  for (const t of tones) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = t.type ?? 'sine';
    const start = now + (t.delay ?? 0);
    osc.frequency.setValueAtTime(t.freq, start);
    if (t.slideTo) osc.frequency.exponentialRampToValueAtTime(t.slideTo, start + t.dur);
    const end = envelope(g, t, start, base * (t.gain ?? 1));
    osc.connect(g).connect(master);
    osc.start(start);
    osc.stop(end + 0.02);
    track(osc);
  }
}

/** Ruído filtrado curtíssimo: textura de "papel" para o toque. */
function playPaper(level: SoundSetting, gain = 0.5, dur = 0.045): void {
  if (!allowsEffects(level)) return;
  const c = getCtx();
  if (!c || !master) return;
  if (c.state === 'suspended') void c.resume();
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2400;
  filter.Q.value = 0.8;
  const g = c.createGain();
  const now = c.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime((GAIN[level] ?? 0) * gain, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(now);
  src.stop(now + dur + 0.01);
  track(src);
}

/* ------------------------------------------------------------ paleta */

export type SoundCue = 'tap' | 'correct' | 'reinforce' | 'transition' | 'complete' | 'token' | 'retry';

const N = { G4: 392, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5 };

/** Timbres padrão (pentatônica, senoide/triângulo, ataques macios). Jogos podem usar `playTones` para os seus. */
export const SOUND_PALETTE: Record<SoundCue, Tone[]> = {
  tap: [{ freq: N.A5, dur: 0.03, attack: 0.004, decay: 0.03, sustain: 0.2, release: 0.04, gain: 0.25 }],
  correct: [
    { freq: N.E5, dur: 0.08, attack: 0.015, decay: 0.05, sustain: 0.5, release: 0.15, gain: 0.8 },
    { freq: N.G5, dur: 0.12, delay: 0.09, attack: 0.015, decay: 0.06, sustain: 0.5, release: 0.2, gain: 0.8 },
  ],
  reinforce: [N.C5, N.E5, N.G5, N.C6].map((freq, i) => ({
    freq, dur: 0.12, delay: i * 0.08, type: 'triangle' as const, attack: 0.02, decay: 0.08, sustain: 0.45, release: 0.25, gain: 0.7,
  })),
  transition: [{ freq: N.G4, slideTo: N.D5, dur: 0.3, attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.2, gain: 0.5 }],
  complete: [
    ...[N.C5, N.E5, N.G5].map((freq) => ({ freq, dur: 0.45, attack: 0.04, decay: 0.15, sustain: 0.5, release: 0.45, gain: 0.45 })),
    { freq: N.C6, dur: 0.4, delay: 0.25, type: 'triangle' as const, attack: 0.04, decay: 0.12, sustain: 0.5, release: 0.5, gain: 0.5 },
  ],
  token: [
    { freq: N.C6, dur: 0.05, attack: 0.006, decay: 0.05, sustain: 0.3, release: 0.12, gain: 0.55 },
    { freq: N.E6, dur: 0.06, delay: 0.06, attack: 0.006, decay: 0.05, sustain: 0.3, release: 0.15, gain: 0.45 },
  ],
  /** Neutro: duas notas iguais e baixas, sem descida "triste" nem dissonância. */
  retry: [
    { freq: N.G4, dur: 0.06, attack: 0.02, decay: 0.05, sustain: 0.4, release: 0.12, gain: 0.45 },
    { freq: N.G4, dur: 0.06, delay: 0.16, attack: 0.02, decay: 0.05, sustain: 0.4, release: 0.12, gain: 0.45 },
  ],
};

/** Toca um cue da paleta respeitando a configuração de som e o mute global. */
export function playCue(cue: SoundCue, setting: SoundSetting): void {
  if (!allowsEffects(setting)) return;
  if (cue === 'tap') playPaper(setting);
  playTones(SOUND_PALETTE[cue], setting);
}

/** Fala em pt-BR via Web Speech (provisório até termos áudio gravado por pessoa real). */
export function speak(text: string, level: SoundSetting, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!allowsSpeech(level) || typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = rate;
    u.volume = level === 'low' ? 0.6 : 1;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('pt'));
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

/** Apenas para testes: descarta o contexto e o estado global. */
export function __resetAudioForTests(): void {
  stopAllSounds();
  ctx = null;
  master = null;
  muted = false;
  muteCbs.clear();
}
