// src/audio/synth.ts
// High-fidelity procedural Web Audio synthesis for 12 instruments, dynamic stems, and UI SFX.
// No external assets required: zero network latency, 100% offline, guaranteed instant response.

import { audioMixer } from './mixer';

export type InstrumentId =
  | 'tambor'
  | 'pandeiro'
  | 'chocalho'
  | 'palmas'
  | 'triangulo'
  | 'agogo'
  | 'xilofone'
  | 'bloco'
  | 'bumbo'
  | 'caixa'
  | 'prato'
  | 'teclado';

export interface NoteTriggerOptions {
  time?: number;          // AudioContext.currentTime, defaults to immediate
  velocity?: number;      // 0.0 to 1.0 (defaults to 1.0)
  pitchOffset?: number;   // Semitone or pitch variation
  noteIndex?: number;     // For melodic instruments (xilofone: 0..5, agogo: 0..1, teclado: 0..7)
}

export class SoundSynth {
  private noiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;

  constructor() {}

  /**
   * Pre-generates cached noise buffers to avoid memory allocation or GC in the audio thread.
   */
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of reusable noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private getPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.pinkNoiseBuffer && this.pinkNoiseBuffer.sampleRate === ctx.sampleRate) {
      return this.pinkNoiseBuffer;
    }
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.pinkNoiseBuffer = buffer;
    return buffer;
  }

  /**
   * Main entry point to play any of the 12 instruments.
   */
  public playInstrument(id: InstrumentId, options: NoteTriggerOptions = {}): void {
    if (typeof window === 'undefined') return;
    const ctx = audioMixer.getContext();
    if (!ctx) return;
    const time = options.time ?? ctx.currentTime;
    const vel = Math.max(0.1, Math.min(1.0, options.velocity ?? 1.0));
    const bus = audioMixer.getInstrumentsBus();

    switch (id) {
      case 'tambor':
        this.synthTambor(ctx, bus, time, vel, options.pitchOffset ?? 0);
        break;
      case 'pandeiro':
        this.synthPandeiro(ctx, bus, time, vel);
        break;
      case 'chocalho':
        this.synthChocalho(ctx, bus, time, vel);
        break;
      case 'palmas':
        this.synthPalmas(ctx, bus, time, vel);
        break;
      case 'triangulo':
        this.synthTriangulo(ctx, bus, time, vel);
        break;
      case 'agogo':
        this.synthAgogo(ctx, bus, time, vel, options.noteIndex ?? 0);
        break;
      case 'xilofone':
        this.synthXilofone(ctx, bus, time, vel, options.noteIndex ?? 0);
        break;
      case 'bloco':
        this.synthBloco(ctx, bus, time, vel);
        break;
      case 'bumbo':
        this.synthBumbo(ctx, bus, time, vel);
        break;
      case 'caixa':
        this.synthCaixa(ctx, bus, time, vel);
        break;
      case 'prato':
        this.synthPrato(ctx, bus, time, vel);
        break;
      case 'teclado':
        this.synthTeclado(ctx, bus, time, vel, options.noteIndex ?? 0);
        break;
    }
  }

  // ==========================================
  // 12 INSTRUMENT SYNTHESIS RECIPES
  // ==========================================

  // 1. TAMBOR (Warm Brazilian resonant drum)
  private synthTambor(ctx: AudioContext, dest: AudioNode, t: number, vel: number, pitchOffset = 0): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFreq = 160 * Math.pow(2, pitchOffset / 12);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 2.2, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.08);

    gain.gain.setValueAtTime(vel * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    // Initial click transient
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(380, t);
    clickGain.gain.setValueAtTime(vel * 0.4, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(dest);
    click.connect(clickGain);
    clickGain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.45);
    click.start(t);
    click.stop(t + 0.03);
  }

  // 2. PANDEIRO (Warm thumb center tap + crisp jingles)
  private synthPandeiro(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    // Thumb thump
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(140, t);
    thump.frequency.exponentialRampToValueAtTime(75, t + 0.08);
    thumpGain.gain.setValueAtTime(vel * 0.7, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    // Jingles (platinelas) high-pass noise
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5500, t);
    filter.Q.setValueAtTime(2, t);

    const jingleGain = ctx.createGain();
    jingleGain.gain.setValueAtTime(vel * 0.5, t);
    jingleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    thump.connect(thumpGain);
    thumpGain.connect(dest);
    noise.connect(filter);
    filter.connect(jingleGain);
    jingleGain.connect(dest);

    thump.start(t);
    thump.stop(t + 0.18);
    noise.start(t);
    noise.stop(t + 0.25);
  }

  // 3. CHOCALHO (Shaker / afoxé)
  private synthChocalho(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    const noise = ctx.createBufferSource();
    noise.buffer = this.getPinkNoiseBuffer(ctx);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(6200, t);
    bandpass.Q.setValueAtTime(2.5, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vel * 0.55, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + 0.16);
  }

  // 4. PALMAS (Acoustic claps with micro-bursts)
  private synthPalmas(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1300, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = ctx.createGain();
    // 3 subtle micro-impulses
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.setValueAtTime(vel * 0.35, t + 0.008);
    gain.gain.setValueAtTime(vel * 0.55, t + 0.018);
    gain.gain.setValueAtTime(vel * 0.85, t + 0.028);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    const noise = ctx.createBufferSource();
    noise.buffer = this.getPinkNoiseBuffer(ctx);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + 0.28);
  }

  // 5. TRIANGULO (Sparkling metallic ringing triangle)
  private synthTriangulo(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2480, t);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(4960, t);

    gain.gain.setValueAtTime(vel * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.65);
    osc2.stop(t + 0.65);
  }

  // 6. AGOGO (High & Low bells)
  private synthAgogo(ctx: AudioContext, dest: AudioNode, t: number, vel: number, noteIndex = 0): void {
    const isHigh = noteIndex % 2 === 1;
    const baseFreq = isHigh ? 1220 : 810;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(baseFreq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2.05, t);

    gain.gain.setValueAtTime(vel * 0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.3);
    osc2.stop(t + 0.3);
  }

  // 7. XILOFONE (Pentatonic tuned wooden keys: C5, D5, E5, G5, A5, C6)
  private synthXilofone(ctx: AudioContext, dest: AudioNode, t: number, vel: number, noteIndex = 0): void {
    const pentatonicScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const freq = pentatonicScale[Math.abs(noteIndex) % pentatonicScale.length];

    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(freq * 3.01, t); // woody chime overtone

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(vel * 0.25, t);
    harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    gain.gain.setValueAtTime(vel * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    harmonic.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(dest);

    osc.start(t);
    harmonic.start(t);
    osc.stop(t + 0.48);
    harmonic.stop(t + 0.1);
  }

  // 8. BLOCO SONORO (Punchy tuned woodblock)
  private synthBloco(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1150, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.04);

    gain.gain.setValueAtTime(vel * 0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // 9. BUMBO (Deep punchy surdo / bass drum)
  private synthBumbo(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(vel * 1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.52);
  }

  // 10. CAIXA (Snare drum: body punch + noise buzz)
  private synthCaixa(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    // Body tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.06);
    oscGain.gain.setValueAtTime(vel * 0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    // Snare wires noise
    const noise = ctx.createBufferSource();
    noise.buffer = this.getPinkNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(vel * 0.75, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(oscGain);
    oscGain.connect(dest);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.14);
    noise.start(t);
    noise.stop(t + 0.24);
  }

  // 11. PRATO (Cymbal crash / splash)
  private synthPrato(ctx: AudioContext, dest: AudioNode, t: number, vel: number): void {
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6800, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + 0.9);
  }

  // 12. TECLADO (Warm electric piano / chords)
  private synthTeclado(ctx: AudioContext, dest: AudioNode, t: number, vel: number, noteIndex = 0): void {
    // Warm chords in C Major / A Minor: C4, E4, G4, A4, B4, C5, D5, E5
    const chordFrequencies = [261.63, 329.63, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
    const freq = chordFrequencies[Math.abs(noteIndex) % chordFrequencies.length];

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vel * 0.6, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
  }

  // ==========================================
  // DYNAMIC COMBO STEM PLAYERS
  // ==========================================

  /**
   * Backing Chords (Plays harmonic accompaniment on the beat)
   */
  public playBackingChord(bar: number, beat: number, t: number): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getStemGain('chords');
    // Simple warm 4-chord progression: C - G - Am - F
    const chordIndex = bar % 4;
    const chords = [
      [261.63, 329.63, 392.00], // C
      [246.94, 293.66, 392.00], // G
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
    ];
    const notes = chords[chordIndex];

    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Play soft stabs on beats 1 and 3 or offbeats
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  /**
   * Dynamic Shaker Stem (Combo 4)
   */
  public playStemShaker(t: number): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getStemGain('shaker');
    const noise = ctx.createBufferSource();
    noise.buffer = this.getPinkNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(7000, t);
    filter.Q.setValueAtTime(3.0, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + 0.13);
  }

  /**
   * Dynamic Bass Groove Stem (Combo 8)
   */
  public playStemBass(bar: number, beat: number, t: number): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getStemGain('bass');

    const roots = [65.41, 48.99, 55.00, 43.65]; // C2, G1, A1, F1
    const root = roots[bar % 4];
    // Funky bass pattern notes
    const freq = beat === 0 ? root : beat === 2 ? root * 1.5 : root;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(140, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  /**
   * Dynamic Crowd Cheering Stem (Combo 12)
   */
  public playStemCrowd(t: number): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getStemGain('crowd');

    const noise = ctx.createBufferSource();
    noise.buffer = this.getPinkNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, t);
    filter.Q.setValueAtTime(1.0, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(t);
    noise.stop(t + 0.5);
  }

  /**
   * Dynamic Concert Lights Arpeggio (Combo 16)
   */
  public playStemLights(t: number, noteStep = 0): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getStemGain('lights');
    const arpeggio = [523.25, 659.25, 783.99, 1046.50];
    const freq = arpeggio[noteStep % arpeggio.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // ==========================================
  // UI SFX
  // ==========================================

  public playUIPop(): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getUIBus();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playUIStar(): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getUIBus();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playMetronomeTick(isDownbeat = false): void {
    const ctx = audioMixer.getContext();
    const dest = audioMixer.getUIBus();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.04);
  }
}

export const soundSynth = new SoundSynth();
