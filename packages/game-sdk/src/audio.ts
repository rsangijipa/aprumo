/**
 * Sons curtos sintetizados (sem arquivos, sem flashes sonoros). Volume segue a adaptação.
 * Cada jogo escolhe seus próprios timbres — aqui só o motor.
 */
let ctx: AudioContext | null = null;
const getCtx = () => (ctx ??= new AudioContext());

export type SoundLevel = 'off' | 'low' | 'normal';
const GAIN: Record<SoundLevel, number> = { off: 0, low: 0.06, normal: 0.14 };

export interface Tone {
  freq: number;
  dur: number;
  type?: OscillatorType;
  delay?: number;
  slideTo?: number;
}

export function playTones(tones: Tone[], level: SoundLevel) {
  if (level === 'off') return;
  const c = getCtx();
  if (c.state === 'suspended') void c.resume();
  const now = c.currentTime;
  for (const t of tones) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = t.type ?? 'sine';
    const start = now + (t.delay ?? 0);
    osc.frequency.setValueAtTime(t.freq, start);
    if (t.slideTo) osc.frequency.exponentialRampToValueAtTime(t.slideTo, start + t.dur);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(GAIN[level], start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
    osc.connect(g).connect(c.destination);
    osc.start(start);
    osc.stop(start + t.dur + 0.02);
  }
}

/** Fala em pt-BR via Web Speech (provisório até termos áudio gravado por pessoa real). */
export function speak(text: string, level: SoundLevel, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (level === 'off' || !('speechSynthesis' in window)) return resolve();
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
