// Sound and Microphone Blowing Detector for DEN-01 Bolhas

class DenverSoundManager {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micInterval: number | null = null;
  private isListeningMic: boolean = false;
  private consecutiveBlowingFrames: number = 0;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
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
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playPop(variant: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Pentatonic scale variations (C5, D5, E5, G5, A5)
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.0];
    const baseFreq = freqs[variant % freqs.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  playBlowing() {
    const ctx = this.getContext();
    if (!ctx) return;

    // Filtered pink/white noise simulation for gentle breath
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.4);
  }

  playChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  /**
   * Starts microphone monitoring to detect physical blowing on the tablet.
   * Dispatches onBlowDetected callback when continuous energy >= threshold for >= 150ms.
   */
  async startMicBlowingDetection(onBlowDetected: () => void): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx || !navigator.mediaDevices?.getUserMedia) return false;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = ctx.createMediaStreamSource(this.micStream);
      this.micAnalyser = ctx.createAnalyser();
      this.micAnalyser.fftSize = 256;
      source.connect(this.micAnalyser);

      const bufferLength = this.micAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.isListeningMic = true;
      this.consecutiveBlowingFrames = 0;

      // Poll audio RMS every 50ms
      this.micInterval = window.setInterval(() => {
        if (!this.micAnalyser || !this.isListeningMic) return;
        this.micAnalyser.getByteFrequencyData(dataArray);

        // Calculate low-frequency breath energy (bins 1 to 20 ~ 50Hz to 1000Hz)
        let sum = 0;
        const lowBins = Math.min(24, bufferLength);
        for (let i = 1; i < lowBins; i++) {
          sum += dataArray[i];
        }
        const avg = sum / lowBins;

        // Energy threshold calibrated for mouth breath
        if (avg > 42) {
          this.consecutiveBlowingFrames++;
          if (this.consecutiveBlowingFrames >= 3) {
            // ~150ms sustained blowing
            onBlowDetected();
            this.consecutiveBlowingFrames = 0;
          }
        } else {
          this.consecutiveBlowingFrames = 0;
        }
      }, 50);

      return true;
    } catch {
      return false;
    }
  }

  stopMicDetection() {
    this.isListeningMic = false;
    if (this.micInterval) {
      clearInterval(this.micInterval);
      this.micInterval = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    this.micAnalyser = null;
  }
}

export const soundManager = new DenverSoundManager();
