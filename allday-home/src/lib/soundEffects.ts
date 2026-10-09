// Sound Effects & Speech Manager for Aldei Home
// Configured for silent operation by default (domestic quiet mode)
// No videogame bleeps, clicks, or disruptive noises.

class SoundEffectsManager {
  private soundEnabled: boolean = false;
  private voiceEnabled: boolean = false;

  constructor() {
    // Keep sound and voice disabled by default for a quiet, peaceful home environment
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aldei_sound_enabled", "false");
        localStorage.setItem("aldei_voice_enabled", "false");
      } catch (e) {}
    }
  }

  public isSoundEnabled(): boolean {
    return false;
  }

  public setSoundEnabled(_enabled: boolean): void {
    this.soundEnabled = false;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aldei_voice_enabled", String(enabled));
      } catch (e) {}
    }
  }

  // Silent no-ops for all interaction tones (completely silent mouse clicks and buttons)
  public playGentleChime(): void {}
  public playMedicationAlertChime(): void {}
  public playSuccessTone(): void {}
  public playWakeTone(): void {}
  public playAcknowledgeTone(): void {}
  public playUpcomingEventAlert(): void {}
  public testChime(): void {}

  /**
   * Speak a reminder only when explicitly activated by user in accessibility settings
   */
  public speak(text: string): void {
    if (!this.voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.startsWith("pt") || v.lang.includes("BR"));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Graceful silence
    }
  }

  public stopAll(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  public speakEventReminder(title: string, timeframe: string): void {
    if (!this.voiceEnabled) return;
    this.speak(`Agenda da casa: ${title} ${timeframe}.`);
  }

  public speakReminder(title: string, member?: string): void {
    if (!this.voiceEnabled) return;
    const text = member
      ? `Lembrete para ${member}: ${title}.`
      : `Lembrete da casa: ${title}.`;
    this.speak(text);
  }
}

export const soundEffects = new SoundEffectsManager();

