/**
 * Production Web Audio API Synthesizer Engine (Sections 57, 58, 59)
 *
 * Provides synthesized, zero-latency sound effects and procedural
 * background music without external asset dependencies or CORS issues.
 *
 * Strict Compliance:
 * - Independent SFX and BGM toggles (persisted in localStorage).
 * - Section 59 Bug Prevention: When SFX is OFF, 0 sounds play. When BGM is OFF, music stops immediately.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.bgmInterval = null;

    // Load persisted preferences (defaults to true)
    const storedSound = localStorage.getItem('bubble_sfx_enabled');
    const storedMusic = localStorage.getItem('bubble_music_enabled');

    this.sfxEnabled = storedSound !== null ? storedSound === 'true' : true;
    this.musicEnabled = storedMusic !== null ? storedMusic === 'true' : true;
    this.isBgmPlaying = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();

        // Master BGM gain
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.musicEnabled ? 0.12 : 0, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);

        // Master SFX gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.35 : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Toggle SFX
  setSoundEnabled(enabled) {
    this.sfxEnabled = Boolean(enabled);
    localStorage.setItem('bubble_sfx_enabled', this.sfxEnabled.toString());
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.35 : 0, this.ctx.currentTime);
    }
  }

  // Toggle Music (Section 58 & 59)
  setMusicEnabled(enabled) {
    this.musicEnabled = Boolean(enabled);
    localStorage.setItem('bubble_music_enabled', this.musicEnabled.toString());

    if (!this.musicEnabled) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  // Button Click (Section 57)
  playButtonClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Bubble Launch / Shoot (Section 57)
  playLaunchSound() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Wall Bounce (Section 57)
  playBounceSound() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Bubble Pop Sound (Section 57)
  playPopSound(pitchMultiplier = 1) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    const baseFreq = 420 * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Combo Sound with Escalating Pitch (Section 36 & 57)
  playComboSound(comboCount = 2) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5 to C6
    const baseNote = notes[Math.min(comboCount, notes.length - 1)];

    [0, 0.06].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + delay;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseNote * (idx === 0 ? 1 : 1.25), time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.15);
    });
  }

  // Bomb Explosion Blast (Section 38 & 57)
  playBombSound() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Rescue Jingle (Section 27 & 57)
  playRescueSound() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C
    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.18);
    });
  }

  // Star Award Twinkle (Section 34 & 57)
  playStarSound(starIndex = 1) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const pitches = [783.99, 987.77, 1318.51]; // G5, B5, E6
    const freq = pitches[starIndex - 1] || 1046.50;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Level Complete Celebration (Section 42 & 57)
  playLevelCompleteSound() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.25);
    });
  }

  // Level Failed (Section 43 & 57)
  playLevelFailedSound() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 392, 349.23, 293.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + idx * 0.14;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  // Booster Activate (Section 39)
  playBoosterSound() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Procedural Background Music (Sections 58 & 59)
  startBGM() {
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    // Upbeat pentatonic cartoon melody loop
    const melody = [
      { note: 261.63, dur: 0.3 }, // C4
      { note: 329.63, dur: 0.3 }, // E4
      { note: 392.00, dur: 0.3 }, // G4
      { note: 523.25, dur: 0.5 }, // C5
      { note: 392.00, dur: 0.3 }, // G4
      { note: 440.00, dur: 0.3 }, // A4
      { note: 523.25, dur: 0.5 }, // C5
      { note: 329.63, dur: 0.4 }  // E4
    ];

    let noteIdx = 0;
    this.bgmInterval = setInterval(() => {
      if (!this.musicEnabled || !this.isBgmPlaying || !this.ctx) {
        this.stopBGM();
        return;
      }

      const item = melody[noteIdx % melody.length];
      noteIdx++;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.note, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.dur);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + item.dur);
      } catch (err) {
        // Silently catch audio state issues
      }
    }, 400);
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

// Singleton audio instance
export const audioManager = new AudioManager();
export default audioManager;
