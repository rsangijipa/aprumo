// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetAudioForTests, allowsEffects, allowsSpeech, installAudioUnlock, isMuted, onMuteChange, playCue, playTones,
  setMuted, SOUND_PALETTE, soundGain,
} from './audio';

const param = () => ({
  value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(),
  cancelScheduledValues: vi.fn(),
});
const node = () => ({ connect: vi.fn((n: unknown) => n) });
type Src = { stop: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn> };
let instances: FakeCtx[] = [];
class FakeCtx {
  state = 'running';
  currentTime = 1;
  sampleRate = 8000;
  destination = {};
  sources: Src[] = [];
  gains: Array<{ gain: ReturnType<typeof param> }> = [];
  resume = vi.fn();
  constructor() { instances.push(this); }
  private src(extra: object) {
    const s = { ...node(), start: vi.fn(), stop: vi.fn(), onended: null, ...extra };
    this.sources.push(s);
    return s;
  }
  createOscillator() { return this.src({ type: 'sine', frequency: param() }); }
  createBufferSource() { return this.src({ buffer: null }); }
  createGain() { const g = { ...node(), gain: param() }; this.gains.push(g); return g; }
  createBiquadFilter() { return { ...node(), type: 'lowpass', frequency: param(), Q: param() }; }
  createBuffer(_c: number, len: number) { const d = new Float32Array(len); return { getChannelData: () => d }; }
}

describe('áudio procedural', () => {
  beforeEach(() => {
    instances = [];
    __resetAudioForTests();
    (window as any).AudioContext = FakeCtx;
  });
  afterEach(() => { delete (window as any).AudioContext; });

  it('cria o AudioContext só no primeiro som (preguiçoso)', () => {
    expect(instances).toHaveLength(0);
    playCue('correct', 'low');
    expect(instances).toHaveLength(1);
    playCue('token', 'normal');
    expect(instances).toHaveLength(1);
  });

  it('desbloqueia no primeiro gesto e remove o ouvinte', () => {
    const off = installAudioUnlock(window);
    expect(instances).toHaveLength(0);
    window.dispatchEvent(new Event('pointerdown'));
    expect(instances).toHaveLength(1);
    off();
  });

  it('off não toca nada; effects toca efeitos mas bloqueia fala', () => {
    playCue('reinforce', 'off');
    expect(instances).toHaveLength(0);
    expect(allowsEffects('effects')).toBe(true);
    expect(allowsSpeech('effects')).toBe(false);
    expect(allowsSpeech('full')).toBe(true);
    expect(allowsSpeech('low')).toBe(true);
    playCue('reinforce', 'effects');
    expect(instances[0]!.sources).toHaveLength(SOUND_PALETTE.reinforce.length);
  });

  it('tap tem textura de papel (ruído) + toque suave', () => {
    playCue('tap', 'normal');
    expect(instances[0]!.sources).toHaveLength(1 + SOUND_PALETTE.tap.length);
  });

  it('ganho é baixo e nunca passa de 0.15', () => {
    for (const s of ['low', 'normal', 'effects', 'full'] as const) expect(soundGain(s)).toBeLessThanOrEqual(0.15);
    for (const tones of Object.values(SOUND_PALETTE)) for (const t of tones) expect(t.gain ?? 1).toBeLessThanOrEqual(1);
  });

  it('mute global para imediatamente o que está tocando e bloqueia novos sons', () => {
    const cb = vi.fn();
    onMuteChange(cb);
    playCue('complete', 'normal');
    const c = instances[0]!;
    const playing = [...c.sources];
    setMuted(true);
    expect(isMuted()).toBe(true);
    expect(cb).toHaveBeenCalledWith(true);
    for (const s of playing) expect(s.stop).toHaveBeenCalledTimes(2); // agendado + imediato
    const master = c.gains[0]!;
    expect(master.gain.setValueAtTime).toHaveBeenLastCalledWith(0, c.currentTime);
    playTones([{ freq: 440, dur: 0.1 }], 'normal');
    playCue('token', 'full');
    expect(c.sources).toHaveLength(playing.length);
    expect(soundGain('normal')).toBe(0);
    setMuted(false);
    expect(master.gain.setValueAtTime).toHaveBeenLastCalledWith(1, c.currentTime);
    playCue('token', 'full');
    expect(c.sources.length).toBeGreaterThan(playing.length);
  });

  it('API legada playTones(tones, nível) continua funcionando', () => {
    playTones([{ freq: 440, dur: 0.2, slideTo: 660 }], 'low');
    expect(instances[0]!.sources).toHaveLength(1);
  });
});
