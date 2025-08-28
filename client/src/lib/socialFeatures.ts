
export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  alarms: string[];
  status: 'awake' | 'sleeping' | 'snoozing';
}

export interface SharedAlarm {
  id: string;
  label: string;
  time: string;
  sharedBy: string;
  participants: string[];
  created: Date;
}

export class SocialFeatures {
  private static readonly FAMILY_KEY = 'family_members';
  private static readonly SHARED_ALARMS_KEY = 'shared_alarms';

  static getFamilyMembers(): FamilyMember[] {
    const stored = localStorage.getItem(this.FAMILY_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static addFamilyMember(member: Omit<FamilyMember, 'id'>): void {
    const members = this.getFamilyMembers();
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString(),
    };
    members.push(newMember);
    localStorage.setItem(this.FAMILY_KEY, JSON.stringify(members));
  }

  static updateMemberStatus(memberId: string, status: FamilyMember['status']): void {
    const members = this.getFamilyMembers();
    const member = members.find(m => m.id === memberId);
    if (member) {
      member.status = status;
      localStorage.setItem(this.FAMILY_KEY, JSON.stringify(members));
    }
  }

  static shareAlarm(alarmId: string, label: string, time: string, participants: string[]): SharedAlarm {
    const sharedAlarms = this.getSharedAlarms();
    const shared: SharedAlarm = {
      id: Date.now().toString(),
      label,
      time,
      sharedBy: 'current_user',
      participants,
      created: new Date()
    };
    
    sharedAlarms.push(shared);
    localStorage.setItem(this.SHARED_ALARMS_KEY, JSON.stringify(sharedAlarms));
    
    return shared;
  }

  static getSharedAlarms(): SharedAlarm[] {
    const stored = localStorage.getItem(this.SHARED_ALARMS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static generateShareCode(alarmId: string): string {
    return btoa(`alarm_${alarmId}_${Date.now()}`).substring(0, 8).toUpperCase();
  }

  static parseShareCode(code: string): string | null {
    try {
      const decoded = atob(code);
      const match = decoded.match(/alarm_(.+?)_/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  static createFamilyChallenge(): { challenge: string; target: number } {
    const challenges = [
      { challenge: "Wake up before 7 AM", target: 7 },
      { challenge: "No snoozing this week", target: 0 },
      { challenge: "Consistent sleep schedule", target: 5 },
      { challenge: "Early bird weekend", target: 2 }
    ];
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  static getFamilyStats(): { totalAwake: number; totalSleeping: number; totalSnoozing: number } {
    const members = this.getFamilyMembers();
    return {
      totalAwake: members.filter(m => m.status === 'awake').length,
      totalSleeping: members.filter(m => m.status === 'sleeping').length,
      totalSnoozing: members.filter(m => m.status === 'snoozing').length
    };
  }
}
