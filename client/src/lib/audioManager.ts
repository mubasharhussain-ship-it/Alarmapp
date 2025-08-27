export class AudioManager {
  private audioContext: AudioContext | null = null;
  private currentSound: HTMLAudioElement | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.audioContext.resume();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async playAlarmSound(toneUrl: string, gradualVolume: boolean = false): Promise<void> {
    try {
      await this.initialize();
      
      this.currentSound = new Audio(toneUrl);
      this.currentSound.loop = true;
      this.currentSound.preload = 'auto';

      if (this.audioContext && gradualVolume) {
        const source = this.audioContext.createMediaElementSource(this.currentSound);
        this.gainNode = this.audioContext.createGain();
        source.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        // Start with low volume and gradually increase
        this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime + 30);
      }

      await this.currentSound.play();
      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
      // Fallback to default browser beep
      this.playDefaultBeep();
    }
  }

  stopAlarmSound(): void {
    if (this.currentSound) {
      this.currentSound.pause();
      this.currentSound.currentTime = 0;
      this.currentSound = null;
    }
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    
    this.isPlaying = false;
  }

  private playDefaultBeep(): void {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 1);
  }

  getDefaultTones(): Array<{ id: string; name: string; url: string; isDefault: boolean }> {
    return [
      {
        id: 'classic-bell',
        name: 'Classic Bell',
        url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUSBjiS1/LNeSsFJHbH8N2QQAoUXrTp66hVFApGn+DyvmUSBjiR1/LNeSsFJHbH8N2QQAoUXrTp66hVFApGn+DyvmUSBg==',
        isDefault: true
      },
      {
        id: 'gentle-chimes',
        name: 'Gentle Chimes',
        url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUSBjiR1/LNeSsFJHbH8N2QQAoUXrTp66hVFApGn+DyvmUSBjiS1/LNeSsFJHbH8N2QQAoUXrTp66hVFApGn+DyvmUSBg==',
        isDefault: true
      },
      {
        id: 'ocean-waves',
        name: 'Ocean Waves',
        url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUSBjiS1/LNeSsFJHbH8N2QQAoUXrTp66hVFApGn+DyvmUSBjiS1/LNeSsFJHbH8N2QQAoUXrTp66hVFApGn+DyvmUSBg==',
        isDefault: true
      }
    ];
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioManager = new AudioManager();
