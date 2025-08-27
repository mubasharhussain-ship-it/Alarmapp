export interface VoiceCommand {
  command: string;
  action: 'create_alarm' | 'delete_alarm' | 'toggle_alarm' | 'snooze' | 'dismiss' | 'unknown';
  parameters: Record<string, any>;
}

export class VoiceController {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onCommandCallback?: (command: VoiceCommand) => void;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();
    }

    if (this.recognition) {
      this.setupRecognition();
    }
  }

  static isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const result = event.results[0][0].transcript.toLowerCase().trim();
      const command = this.parseCommand(result);
      this.onCommandCallback?.(command);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  startListening(onCommand: (command: VoiceCommand) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        resolve(true);
        return;
      }

      this.onCommandCallback = onCommand;

      try {
        this.recognition.start();
        this.isListening = true;
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private parseCommand(text: string): VoiceCommand {
    const command: VoiceCommand = {
      command: text,
      action: 'unknown',
      parameters: {}
    };

    // Create alarm patterns
    if (this.matchesPattern(text, ['set', 'create', 'add', 'make']) && 
        this.matchesPattern(text, ['alarm'])) {
      command.action = 'create_alarm';
      command.parameters = this.extractAlarmParameters(text);
    }
    // Delete alarm patterns
    else if (this.matchesPattern(text, ['delete', 'remove', 'cancel']) && 
             this.matchesPattern(text, ['alarm'])) {
      command.action = 'delete_alarm';
      command.parameters = this.extractIdentifier(text);
    }
    // Toggle alarm patterns
    else if (this.matchesPattern(text, ['turn', 'switch']) && 
             (this.matchesPattern(text, ['on', 'off']) || this.matchesPattern(text, ['enable', 'disable']))) {
      command.action = 'toggle_alarm';
      command.parameters = {
        enabled: this.matchesPattern(text, ['on', 'enable']),
        ...this.extractIdentifier(text)
      };
    }
    // Snooze patterns
    else if (this.matchesPattern(text, ['snooze'])) {
      command.action = 'snooze';
    }
    // Dismiss patterns
    else if (this.matchesPattern(text, ['dismiss', 'stop', 'turn off'])) {
      command.action = 'dismiss';
    }

    return command;
  }

  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private extractAlarmParameters(text: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract time
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
      /(\d{1,2})\s*(am|pm)/i,
      /(\d{1,2})\s*o'?clock/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3] || (match.length > 3 ? match[match.length - 1] : '');

        if (period.toLowerCase() === 'pm' && hours !== 12) {
          hours += 12;
        } else if (period.toLowerCase() === 'am' && hours === 12) {
          hours = 0;
        }

        params.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        break;
      }
    }

    // Extract label
    const labelPatterns = [
      /for (.+?)(?:\s+at|\s+in|\s*$)/i,
      /called (.+?)(?:\s+at|\s+in|\s*$)/i,
      /named (.+?)(?:\s+at|\s+in|\s*$)/i
    ];

    for (const pattern of labelPatterns) {
      const match = text.match(pattern);
      if (match) {
        params.label = match[1].trim();
        break;
      }
    }

    // Extract repeat pattern
    if (this.matchesPattern(text, ['daily', 'every day'])) {
      params.repeatDays = [0, 1, 2, 3, 4, 5, 6];
    } else if (this.matchesPattern(text, ['weekdays', 'work days'])) {
      params.repeatDays = [1, 2, 3, 4, 5];
    } else if (this.matchesPattern(text, ['weekends'])) {
      params.repeatDays = [0, 6];
    }

    // Extract duration for relative alarms
    const durationMatch = text.match(/in (\d+) (minute|hour|second)s?/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      let minutes = 0;
      if (unit.startsWith('minute')) minutes = value;
      else if (unit.startsWith('hour')) minutes = value * 60;
      else if (unit.startsWith('second')) minutes = Math.max(1, Math.floor(value / 60));

      const now = new Date();
      now.setMinutes(now.getMinutes() + minutes);
      params.time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    return params;
  }

  private extractIdentifier(text: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Try to extract alarm identifier (label or time)
    const timeMatch = text.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?/i);
    if (timeMatch) {
      params.timeIdentifier = timeMatch[0];
    }

    // Extract label reference
    const labelPatterns = [
      /the (.+?) alarm/i,
      /alarm (.+?)(?:\s|$)/i
    ];

    for (const pattern of labelPatterns) {
      const match = text.match(pattern);
      if (match) {
        params.labelIdentifier = match[1].trim();
        break;
      }
    }

    return params;
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      speechSynthesis.speak(utterance);
    });
  }

  getCapabilities(): string[] {
    const capabilities = [];
    
    if (this.recognition) {
      capabilities.push('speech_recognition');
    }
    
    if ('speechSynthesis' in window) {
      capabilities.push('speech_synthesis');
    }
    
    return capabilities;
  }
}