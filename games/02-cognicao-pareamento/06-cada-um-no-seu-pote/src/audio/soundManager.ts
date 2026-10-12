import type { MaterialType } from '../types';

export const PRAISES = [
  'Muito bem!',
  'No pote certinho!',
  'Excelente!',
  'Que capricho!',
  'Isso aí!',
  'Você conseguiu!',
  'Show de bola!',
  'Certinho!'
];

class SoundManager {
  private isMuted: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  private ensureAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound of material landing into pot:
   * - plastico: crisp click
   * - pelucia: soft thud
   * - madeira: solid wooden knock
   */
  public playMaterialDrop(material: MaterialType = 'plastico') {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (material === 'pelucia') {
      // Soft low thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    } else if (material === 'madeira') {
      // Crisp wood knock
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    } else {
      // Plastico
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Snap of lid closing on correct drop
   */
  public playLidSnap() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playSD(text: string = 'Coloca com os iguais'): Promise<number> {
    return new Promise(resolve => {
      if (typeof window === 'undefined' || this.isMuted || !('speechSynthesis' in window)) {
        setTimeout(() => resolve(700), 700);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1.1;

      const startTime = performance.now();
      utterance.onend = () => {
        resolve(Math.max(500, Math.round(performance.now() - startTime)));
      };
      utterance.onerror = () => resolve(700);

      window.speechSynthesis.speak(utterance);
    });
  }

  public setSound(level: 'off' | 'low' | 'normal') {
    this.setMuted(level === 'off');
    if (level === 'off' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public playRandomPraise(): string {
    const phrase = PRAISES[Math.floor(Math.random() * PRAISES.length)] ?? 'Muito bem!';
    this.playLidSnap();

    if (typeof window !== 'undefined' && !this.isMuted && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
    return phrase;
  }
}

export const soundManager = new SoundManager();
