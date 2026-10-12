/* ==========================================================================
   SPEECH SYNTHESIS HELPER — VIDA ONLINE
   Accessibility TTS for reading incoming messages and choices aloud
   ========================================================================== */

class SpeechReader {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritizar voz em Português do Brasil (pt-BR)
    const ptVoice = voices.find((v) => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
    if (ptVoice) {
      this.voice = ptVoice;
    }
  }

  public speak(text: string) {
    if (!this.synth) return;
    this.synth.cancel(); // interrompe fala anterior

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechReader = new SpeechReader();
