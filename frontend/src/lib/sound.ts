"use client";

/**
 * Convertly Audio & Haptics Engine (§7.7, §15)
 * Utilizes Web Audio API for zero-latency, zero-network acoustic micro-interactions.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("convertly_sound_enabled");
      this.enabled = saved !== "false"; // Default enabled
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("convertly_sound_enabled", String(this.enabled));
    }
    if (this.enabled) {
      this.playPop(800); // Play demo tap when enabling
    }
    return this.enabled;
  }

  /**
   * Play a crisp, subtle acoustic pop / tap (for file selection & clicks)
   */
  public playPop(freq: number = 600) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);

      // Trigger crisp haptic tick on mobile devices (§7.7)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
    } catch (e) {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  }

  /**
   * Play a gentle, satisfying two-tone acoustic chime (for job completion)
   */
  public playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // First tone (E5 ~ 659.25 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Second tone (G#5 ~ 830.61 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(830.61, now + 0.1);
      gain2.gain.setValueAtTime(0.08, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);

      // Trigger double haptic pulse on mobile devices (§7.7)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([15, 50, 20]);
      }
    } catch (e) {
      // Ignore audio errors
    }
  }

  /**
   * Play a soft, muted acoustic thud (for errors or invalid drops)
   */
  public playError() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      // Trigger error haptic buzz on mobile
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 30, 30]);
      }
    } catch (e) {
      // Ignore audio errors
    }
  }
}

export const sound = new SoundEngine();
