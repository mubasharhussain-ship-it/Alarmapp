export interface MotionConfig {
  sensitivity: number; // 0-100
  duration: number; // milliseconds of shaking required
  threshold: number; // minimum acceleration change
}

export class MotionDetector {
  private isListening = false;
  private startTime = 0;
  private shakeCount = 0;
  private lastAcceleration = { x: 0, y: 0, z: 0 };
  private onShakeDetected?: () => void;
  private config: MotionConfig;

  constructor(config: Partial<MotionConfig> = {}) {
    this.config = {
      sensitivity: 70,
      duration: 1000,
      threshold: 15,
      ...config
    };
  }

  static isSupported(): boolean {
    return 'DeviceMotionEvent' in window && typeof DeviceMotionEvent.requestPermission !== 'undefined';
  }

  static async requestPermission(): Promise<boolean> {
    try {
      if ('DeviceMotionEvent' in window && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      }
      // For Android and other browsers that don't require permission
      return true;
    } catch (error) {
      console.error('Motion permission request failed:', error);
      return false;
    }
  }

  startListening(onShakeDetected: () => void): void {
    this.onShakeDetected = onShakeDetected;
    this.isListening = true;
    this.shakeCount = 0;
    this.startTime = Date.now();

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion.bind(this));
    } else {
      console.warn('Device motion not supported');
      // Fallback for testing on desktop
      this.setupKeyboardFallback();
    }
  }

  stopListening(): void {
    this.isListening = false;
    window.removeEventListener('devicemotion', this.handleMotion.bind(this));
    window.removeEventListener('keydown', this.handleKeyboardFallback.bind(this));
  }

  private handleMotion(event: DeviceMotionEvent): void {
    if (!this.isListening || !event.accelerationIncludingGravity) return;

    const { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity;
    
    // Calculate acceleration change
    const deltaX = Math.abs(x - this.lastAcceleration.x);
    const deltaY = Math.abs(y - this.lastAcceleration.y);
    const deltaZ = Math.abs(z - this.lastAcceleration.z);
    
    const totalDelta = deltaX + deltaY + deltaZ;
    
    // Update last acceleration
    this.lastAcceleration = { x, y, z };
    
    // Check if motion exceeds threshold
    const adjustedThreshold = this.config.threshold * (this.config.sensitivity / 100);
    
    if (totalDelta > adjustedThreshold) {
      this.shakeCount++;
      
      // Check if shake pattern is complete
      if (this.shakeCount >= 5) { // Require at least 5 shake movements
        const elapsed = Date.now() - this.startTime;
        
        if (elapsed <= this.config.duration) {
          this.onShakeDetected?.();
          this.reset();
        } else if (elapsed > this.config.duration * 2) {
          // Reset if too much time has passed
          this.reset();
        }
      }
    }
  }

  private setupKeyboardFallback(): void {
    // For testing on desktop - press 'S' key multiple times quickly
    let keyPresses = 0;
    let lastKeyTime = 0;

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 's') {
        const now = Date.now();
        
        if (now - lastKeyTime < 200) { // Quick successive presses
          keyPresses++;
        } else {
          keyPresses = 1;
        }
        
        lastKeyTime = now;
        
        if (keyPresses >= 5) {
          this.onShakeDetected?.();
          keyPresses = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
  }

  private handleKeyboardFallback(event: KeyboardEvent): void {
    // This is just for the event listener cleanup
  }

  private reset(): void {
    this.shakeCount = 0;
    this.startTime = Date.now();
  }

  updateConfig(newConfig: Partial<MotionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getProgress(): number {
    if (!this.isListening) return 0;
    
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min((this.shakeCount / 5) * 100, 100);
    
    return progress;
  }
}