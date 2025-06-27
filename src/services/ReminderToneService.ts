export class ReminderToneService {
  private static instance: ReminderToneService;
  private audioContext: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private constructor() {
    this.initializeAudioContext();
  }

  static getInstance(): ReminderToneService {
    if (!ReminderToneService.instance) {
      ReminderToneService.instance = new ReminderToneService();
    }
    return ReminderToneService.instance;
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  getAvailableTones() {
    return [
      {
        id: 'gentle-bell',
        name: 'Gentle Bell',
        description: 'Soft, pleasant bell sound',
        frequency: 800,
        duration: 1000,
        pattern: 'single' as const
      },
      {
        id: 'notification-chime',
        name: 'Notification Chime',
        description: 'Modern notification sound',
        frequency: 1000,
        duration: 500,
        pattern: 'double' as const
      },
      {
        id: 'urgent-beep',
        name: 'Urgent Beep',
        description: 'Attention-grabbing beep',
        frequency: 1200,
        duration: 300,
        pattern: 'triple' as const
      },
      {
        id: 'meditation-bowl',
        name: 'Meditation Bowl',
        description: 'Calming singing bowl',
        frequency: 600,
        duration: 2000,
        pattern: 'single' as const
      },
      {
        id: 'digital-alert',
        name: 'Digital Alert',
        description: 'Sharp digital alert tone',
        frequency: 1500,
        duration: 200,
        pattern: 'double' as const
      }
    ];
  }

  async playTone(toneId: string, volume: number = 0.3) {
    await this.ensureAudioContext();
    
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    const tone = this.getAvailableTones().find(t => t.id === toneId);
    if (!tone) {
      console.warn('Tone not found:', toneId);
      return;
    }

    try {
      this.stopAllTones(); // Stop any currently playing tones

      const playCount = tone.pattern === 'single' ? 1 : 
                       tone.pattern === 'double' ? 2 : 
                       tone.pattern === 'triple' ? 3 : 1;

      for (let i = 0; i < playCount; i++) {
        setTimeout(() => {
          this.createAndPlayOscillator(tone.frequency, tone.duration, volume);
        }, i * (tone.duration + 200)); // 200ms gap between repeats
      }
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }

  private createAndPlayOscillator(frequency: number, duration: number, volume: number) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      // Envelope for smooth attack and release
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);

      this.activeOscillators.push(oscillator);

      oscillator.onended = () => {
        const index = this.activeOscillators.indexOf(oscillator);
        if (index > -1) {
          this.activeOscillators.splice(index, 1);
        }
      };
    } catch (error) {
      console.error('Error creating oscillator:', error);
    }
  }

  stopAllTones() {
    this.activeOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (error) {
        // Oscillator might already be stopped
      }
    });
    this.activeOscillators = [];
  }

  async testTone(toneId: string) {
    await this.playTone(toneId, 0.5);
  }
}

export const reminderToneService = ReminderToneService.getInstance();