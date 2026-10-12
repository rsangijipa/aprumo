import type { LocutorId } from '../types';

export const PRAISES = [
  'Muito bem!',
  'Isso aí, igualzinho!',
  'Excelente!',
  'Que capricho!',
  'Você acertou!',
  'Parabéns!',
  'Show de bola!',
  'Certinho!'
];

export const SD_PHRASES = [
  'Junta igual',
  'Coloca com o igual',
  'Acha o igual'
];

class SoundManager {
  private isMuted: boolean = false;
  private currentLocutor: LocutorId = 'locutor_1';
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
      console.warn('Web Audio not supported directly', e);
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

  public setLocutor(locutor: LocutorId) {
    this.currentLocutor = locutor;
  }

  public getLocutor(): LocutorId {
    return this.currentLocutor;
  }

  /**
   * Kenney CC0 Soft Snap Click (<150 ms)
   * Plays soft wooden/plastic snap when sample snaps into matching slot
   */
  public playSnap() {
    if (this.isMuted) return;
    this.ensureAudioContext();

    if (this.audioCtx) {
      // Synthesize soft, organic wood-block snap sound (<120ms)
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  /**
   * Gentle, warm positive reinforcement chime (harmonic triad C5 - E5 - G5)
   */
  public playChime() {
    if (this.isMuted) return;
    this.ensureAudioContext();

    if (this.audioCtx) {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    }
  }

  /**
   * Plays the Discriminative Stimulus (SD)
   * Returns a Promise resolving to the duration in ms so latency can be measured accurately
   */
  public playSD(text: string = 'Junta igual'): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || this.isMuted || !('speechSynthesis' in window)) {
        // Fallback simulate timing (800ms)
        setTimeout(() => resolve(800), 800);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';

      // Adjust parameters based on locutor for vocal generalization
      if (this.currentLocutor === 'locutor_1') {
        utterance.pitch = 1.15;
        utterance.rate = 0.95;
      } else if (this.currentLocutor === 'locutor_2') {
        utterance.pitch = 0.9;
        utterance.rate = 0.9;
      } else {
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
      }

      // Try selecting voice if available
      const voices = window.speechSynthesis.getVoices();
      const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
      if (ptVoices.length > 0) {
        if (this.currentLocutor === 'locutor_2' && ptVoices.length > 1) {
          utterance.voice = ptVoices[1];
        } else {
          utterance.voice = ptVoices[0];
        }
      }

      const startTime = performance.now();
      utterance.onend = () => {
        const duration = performance.now() - startTime;
        resolve(Math.max(500, Math.round(duration)));
      };

      utterance.onerror = () => {
        resolve(800);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Plays one of the 8 varied praise phrases
   */
  public playRandomPraise(): string {
    const phrase = PRAISES[Math.floor(Math.random() * PRAISES.length)];
    this.playChime();

    if (typeof window !== 'undefined' && !this.isMuted && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'pt-BR';
      utterance.pitch = 1.2;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
    return phrase;
  }
}

export const soundManager = new SoundManager();
