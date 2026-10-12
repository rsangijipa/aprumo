// src/audio/mixer.ts
// Web Audio Graph with master limiter, compressor, buses, and dynamic stem volume control.

export interface AudioMixerOptions {
  masterVolume?: number;
  instrumentsVolume?: number;
  musicVolume?: number;
  uiVolume?: number;
}

export class AudioMixer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  
  // Audio buses
  private instrumentsBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private uiBus: GainNode | null = null;
  
  // Dynamic music stem gain nodes for combos
  private stemShakerGain: GainNode | null = null;
  private stemBassGain: GainNode | null = null;
  private stemCrowdGain: GainNode | null = null;
  private stemLightsGain: GainNode | null = null;
  private stemChordsGain: GainNode | null = null;

  // Stored volume preferences (0 to 1)
  private masterVol = 0.9;
  private instrumentsVol = 0.95;
  private musicVol = 0.8;
  private uiVol = 0.85;

  constructor() {}

  /**
   * Lazily initialize or resume the AudioContext upon user gesture.
   */
  public init(): AudioContext {
    if (typeof window === 'undefined') {
      return null as unknown as AudioContext;
    }
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupGraph();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx!;
  }

  public getContext(): AudioContext {
    return this.init();
  }

  private setupGraph(): void {
    if (!this.ctx) return;

    // Master Limiter (DynamicsCompressor configured as a transparent peak limiter)
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime); // -1 dBFS
    this.limiter.knee.setValueAtTime(0, this.ctx.currentTime);         // hard knee limiter
    this.limiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);     // heavy limiting ratio
    this.limiter.attack.setValueAtTime(0.002, this.ctx.currentTime);   // 2ms fast attack
    this.limiter.release.setValueAtTime(0.05, this.ctx.currentTime);   // 50ms fast release

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);

    // Wire limiter -> masterGain -> destination
    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Buses
    this.instrumentsBus = this.ctx.createGain();
    this.instrumentsBus.gain.setValueAtTime(this.instrumentsVol, this.ctx.currentTime);
    this.instrumentsBus.connect(this.limiter);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    this.musicBus.connect(this.limiter);

    this.uiBus = this.ctx.createGain();
    this.uiBus.gain.setValueAtTime(this.uiVol, this.ctx.currentTime);
    this.uiBus.connect(this.limiter);

    // Dynamic music stems (route into musicBus)
    this.stemChordsGain = this.ctx.createGain();
    this.stemChordsGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.stemChordsGain.connect(this.musicBus);

    this.stemShakerGain = this.ctx.createGain();
    this.stemShakerGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // activated on combo 4
    this.stemShakerGain.connect(this.musicBus);

    this.stemBassGain = this.ctx.createGain();
    this.stemBassGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // activated on combo 8
    this.stemBassGain.connect(this.musicBus);

    this.stemCrowdGain = this.ctx.createGain();
    this.stemCrowdGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // activated on combo 12
    this.stemCrowdGain.connect(this.musicBus);

    this.stemLightsGain = this.ctx.createGain();
    this.stemLightsGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // activated on combo 16
    this.stemLightsGain.connect(this.musicBus);
  }

  // Bus accessors
  public getInstrumentsBus(): GainNode {
    this.init();
    return this.instrumentsBus!;
  }

  public getMusicBus(): GainNode {
    this.init();
    return this.musicBus!;
  }

  public getUIBus(): GainNode {
    this.init();
    return this.uiBus!;
  }

  public getStemGain(stem: 'chords' | 'shaker' | 'bass' | 'crowd' | 'lights'): GainNode {
    this.init();
    switch (stem) {
      case 'chords': return this.stemChordsGain!;
      case 'shaker': return this.stemShakerGain!;
      case 'bass': return this.stemBassGain!;
      case 'crowd': return this.stemCrowdGain!;
      case 'lights': return this.stemLightsGain!;
    }
  }

  /**
   * Smoothly fade a dynamic stem gain (avoid clicks/pops)
   */
  public setStemVolume(stem: 'chords' | 'shaker' | 'bass' | 'crowd' | 'lights', targetGain: number, fadeTime = 0.25): void {
    if (!this.ctx) return;
    const gainNode = this.getStemGain(stem);
    const now = this.ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(Math.max(0, Math.min(1.5, targetGain)), now + fadeTime);
  }

  // Volume controls (0 to 1)
  public setMasterVolume(v: number): void {
    this.masterVol = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
  }

  public setInstrumentsVolume(v: number): void {
    this.instrumentsVol = Math.max(0, Math.min(1, v));
    if (this.instrumentsBus && this.ctx) {
      this.instrumentsBus.gain.setValueAtTime(this.instrumentsVol, this.ctx.currentTime);
    }
  }

  public setMusicVolume(v: number): void {
    this.musicVol = Math.max(0, Math.min(1, v));
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    }
  }

  public setUIVolume(v: number): void {
    this.uiVol = Math.max(0, Math.min(1, v));
    if (this.uiBus && this.ctx) {
      this.uiBus.gain.setValueAtTime(this.uiVol, this.ctx.currentTime);
    }
  }

  public getMasterVolume(): number { return this.masterVol; }
  public getInstrumentsVolume(): number { return this.instrumentsVol; }
  public getMusicVolume(): number { return this.musicVol; }
  public getUIVolume(): number { return this.uiVol; }
}

export const audioMixer = new AudioMixer();
