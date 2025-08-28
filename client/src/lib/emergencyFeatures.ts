
export interface MedicalReminder {
  id: string;
  medication: string;
  dosage: string;
  times: string[];
  frequency: 'daily' | 'weekly' | 'as_needed';
  important: boolean;
  doctor: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

export interface EmergencyAlarm {
  id: string;
  type: 'medical' | 'safety' | 'emergency';
  time: string;
  message: string;
  autoCall?: boolean;
  contactId?: string;
}

export class EmergencyFeatures {
  private static readonly MEDICAL_REMINDERS_KEY = 'medical_reminders';
  private static readonly EMERGENCY_CONTACTS_KEY = 'emergency_contacts';
  private static readonly EMERGENCY_ALARMS_KEY = 'emergency_alarms';

  // Medical Reminders
  static addMedicalReminder(reminder: Omit<MedicalReminder, 'id'>): void {
    const reminders = this.getMedicalReminders();
    const newReminder: MedicalReminder = {
      ...reminder,
      id: Date.now().toString()
    };
    reminders.push(newReminder);
    localStorage.setItem(this.MEDICAL_REMINDERS_KEY, JSON.stringify(reminders));
  }

  static getMedicalReminders(): MedicalReminder[] {
    const stored = localStorage.getItem(this.MEDICAL_REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static updateMedicalReminder(id: string, updates: Partial<MedicalReminder>): void {
    const reminders = this.getMedicalReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updates };
      localStorage.setItem(this.MEDICAL_REMINDERS_KEY, JSON.stringify(reminders));
    }
  }

  static deleteMedicalReminder(id: string): void {
    const reminders = this.getMedicalReminders().filter(r => r.id !== id);
    localStorage.setItem(this.MEDICAL_REMINDERS_KEY, JSON.stringify(reminders));
  }

  // Emergency Contacts
  static addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): void {
    const contacts = this.getEmergencyContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString()
    };
    contacts.push(newContact);
    contacts.sort((a, b) => a.priority - b.priority);
    localStorage.setItem(this.EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
  }

  static getEmergencyContacts(): EmergencyContact[] {
    const stored = localStorage.getItem(this.EMERGENCY_CONTACTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): void {
    const contacts = this.getEmergencyContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      contacts.sort((a, b) => a.priority - b.priority);
      localStorage.setItem(this.EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
    }
  }

  static deleteEmergencyContact(id: string): void {
    const contacts = this.getEmergencyContacts().filter(c => c.id !== id);
    localStorage.setItem(this.EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
  }

  // Emergency Alarms
  static createEmergencyAlarm(alarm: Omit<EmergencyAlarm, 'id'>): void {
    const alarms = this.getEmergencyAlarms();
    const newAlarm: EmergencyAlarm = {
      ...alarm,
      id: Date.now().toString()
    };
    alarms.push(newAlarm);
    localStorage.setItem(this.EMERGENCY_ALARMS_KEY, JSON.stringify(alarms));
  }

  static getEmergencyAlarms(): EmergencyAlarm[] {
    const stored = localStorage.getItem(this.EMERGENCY_ALARMS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Emergency Actions
  static async triggerEmergencyCall(contactId: string): Promise<boolean> {
    const contacts = this.getEmergencyContacts();
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) return false;

    try {
      // Attempt to make emergency call
      if ('navigator' in window && 'share' in navigator) {
        await navigator.share({
          title: 'Emergency Contact',
          text: `Emergency! Please call ${contact.name} at ${contact.phone}`,
          url: `tel:${contact.phone}`
        });
        return true;
      } else {
        // Fallback: open phone dialer
        window.open(`tel:${contact.phone}`, '_blank');
        return true;
      }
    } catch (error) {
      console.error('Emergency call failed:', error);
      return false;
    }
  }

  static sendEmergencyNotification(message: string): void {
    // Send notification to emergency contacts
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medical Reminder', {
        body: message,
        icon: '/icons/medical-icon.png',
        badge: '/icons/medical-badge.png',
        tag: 'medical-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 400]
      });
    }

    // Also trigger device vibration for critical reminders
    if ('vibrate' in navigator) {
      navigator.vibrate([1000, 500, 1000, 500, 1000]);
    }
  }

  static checkMissedMedications(): MedicalReminder[] {
    const reminders = this.getMedicalReminders();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const missed = reminders.filter(reminder => {
      if (reminder.frequency !== 'daily') return false;
      
      return reminder.times.some(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // Check if reminder time has passed today
        return reminderTime < now && reminderTime.toDateString() === now.toDateString();
      });
    });

    return missed;
  }

  static generateMedicalReport(): {
    totalReminders: number;
    missedToday: number;
    complianceRate: number;
    criticalMedications: MedicalReminder[];
  } {
    const reminders = this.getMedicalReminders();
    const missed = this.checkMissedMedications();
    const critical = reminders.filter(r => r.important);
    
    const totalDailyReminders = reminders.filter(r => r.frequency === 'daily').length;
    const complianceRate = totalDailyReminders > 0 ? 
      ((totalDailyReminders - missed.length) / totalDailyReminders) * 100 : 100;

    return {
      totalReminders: reminders.length,
      missedToday: missed.length,
      complianceRate: Math.round(complianceRate),
      criticalMedications: critical
    };
  }

  static scheduleHealthCheckAlarm(): void {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const healthCheckAlarm: EmergencyAlarm = {
      id: 'health-check-' + Date.now(),
      type: 'medical',
      time: '09:00',
      message: '🏥 Monthly Health Check Reminder - Schedule your routine checkup!',
      autoCall: false
    };

    this.createEmergencyAlarm(healthCheckAlarm);
  }

  static getEmergencyInstructions(type: 'heart_attack' | 'stroke' | 'allergic_reaction' | 'fall'): string[] {
    const instructions = {
      heart_attack: [
        "Call 911 immediately",
        "Chew an aspirin if available and not allergic",
        "Sit down and rest",
        "Loosen tight clothing",
        "Stay calm and wait for help"
      ],
      stroke: [
        "Call 911 immediately",
        "Note the time symptoms started",
        "Keep the person comfortable",
        "Do not give food or water",
        "Monitor breathing and pulse"
      ],
      allergic_reaction: [
        "Call 911 if severe reaction",
        "Use EpiPen if available",
        "Remove or avoid the allergen",
        "Take antihistamine if mild",
        "Monitor breathing carefully"
      ],
      fall: [
        "Don't move if injured",
        "Call for help",
        "Check for consciousness",
        "Apply ice to injuries",
        "Seek medical attention if needed"
      ]
    };

    return instructions[type] || instructions.heart_attack;
  }
}
