// Sound synthesis using Web Audio API and Web Speech API for ABA-07 Leitura de Cena

export type SoundLevel = 'off' | 'low' | 'normal';

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundLevel: SoundLevel = 'low';

  setSound(level: SoundLevel) {
    this.soundLevel = level;
    if (level === 'off') {
      this.stopAll();
    }
  }

  getSound(): SoundLevel {
    return this.soundLevel;
  }

  stopAll() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  private getGainMultiplier(): number {
    if (this.soundLevel === 'off') return 0;
    if (this.soundLevel === 'low') return 0.35;
    return 1.0;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined' || this.soundLevel === 'off') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playClick() {
    if (this.soundLevel === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;
    const mult = this.getGainMultiplier();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08 * mult, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playSuccess() {
    if (this.soundLevel === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;
    const mult = this.getGainMultiplier();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12 * mult, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  }

  playCueFound() {
    if (this.soundLevel === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;
    const mult = this.getGainMultiplier();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
    gain.gain.setValueAtTime(0.1 * mult, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playGentleTryAgain() {
    if (this.soundLevel === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;
    const mult = this.getGainMultiplier();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);
    gain.gain.setValueAtTime(0.08 * mult, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  speak(text: string) {
    if (this.soundLevel === 'off') return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.volume = this.soundLevel === 'low' ? 0.45 : 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

export const soundManager = new SoundManager();

