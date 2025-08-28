
export interface FocusSession {
  id: string;
  type: 'pomodoro' | 'deep_work' | 'break' | 'meditation';
  duration: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  productivity_score?: number;
}

export interface ProductivityStats {
  daily_focus_time: number;
  completed_sessions: number;
  average_productivity: number;
  streak_days: number;
  best_focus_time: string;
}

export class ProductivityIntegration {
  private static readonly FOCUS_SESSIONS_KEY = 'focus_sessions';
  private static readonly PRODUCTIVITY_STATS_KEY = 'productivity_stats';
  
  static startFocusSession(type: FocusSession['type'], duration: number): FocusSession {
    const session: FocusSession = {
      id: Date.now().toString(),
      type,
      duration,
      startTime: new Date(),
      completed: false
    };
    
    const sessions = this.getFocusSessions();
    sessions.push(session);
    localStorage.setItem(this.FOCUS_SESSIONS_KEY, JSON.stringify(sessions));
    
    return session;
  }

  static completeFocusSession(sessionId: string, productivityScore: number): void {
    const sessions = this.getFocusSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      session.endTime = new Date();
      session.completed = true;
      session.productivity_score = productivityScore;
      localStorage.setItem(this.FOCUS_SESSIONS_KEY, JSON.stringify(sessions));
      
      this.updateProductivityStats();
    }
  }

  static getFocusSessions(): FocusSession[] {
    const stored = localStorage.getItem(this.FOCUS_SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static updateProductivityStats(): void {
    const sessions = this.getFocusSessions();
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => 
      new Date(s.startTime).toDateString() === today && s.completed
    );

    const dailyFocusTime = todaySessions.reduce((total, session) => 
      total + session.duration, 0
    );

    const completedSessions = todaySessions.length;
    const averageProductivity = todaySessions.length > 0 ? 
      todaySessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / todaySessions.length : 0;

    const streak = this.calculateStreakDays(sessions);
    const bestFocusTime = this.getBestFocusTime(sessions);

    const stats: ProductivityStats = {
      daily_focus_time: dailyFocusTime,
      completed_sessions: completedSessions,
      average_productivity: averageProductivity,
      streak_days: streak,
      best_focus_time: bestFocusTime
    };

    localStorage.setItem(this.PRODUCTIVITY_STATS_KEY, JSON.stringify(stats));
  }

  private static calculateStreakDays(sessions: FocusSession[]): number {
    const days = [...new Set(sessions
      .filter(s => s.completed)
      .map(s => new Date(s.startTime).toDateString())
    )].sort();

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString();
      if (days.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private static getBestFocusTime(sessions: FocusSession[]): string {
    const hourlyProductivity: { [hour: number]: number[] } = {};
    
    sessions.filter(s => s.completed && s.productivity_score).forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (!hourlyProductivity[hour]) hourlyProductivity[hour] = [];
      hourlyProductivity[hour].push(session.productivity_score!);
    });

    let bestHour = 9; // Default to 9 AM
    let bestScore = 0;

    Object.entries(hourlyProductivity).forEach(([hour, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestHour = parseInt(hour);
      }
    });

    return `${bestHour.toString().padStart(2, '0')}:00`;
  }

  static getProductivityStats(): ProductivityStats | null {
    const stored = localStorage.getItem(this.PRODUCTIVITY_STATS_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static suggestOptimalAlarmTime(): string {
    const stats = this.getProductivityStats();
    if (!stats) return '07:00';

    // Parse best focus time and suggest waking up 1-2 hours before
    const [hours] = stats.best_focus_time.split(':').map(Number);
    const wakeHour = Math.max(5, hours - 2); // Never earlier than 5 AM
    
    return `${wakeHour.toString().padStart(2, '0')}:00`;
  }

  static createProductivityAlarms(): Array<{time: string, label: string, type: string}> {
    const stats = this.getProductivityStats();
    const alarms = [];

    // Morning productivity alarm
    const morningTime = this.suggestOptimalAlarmTime();
    alarms.push({
      time: morningTime,
      label: "🚀 Prime Productivity Time",
      type: "productivity"
    });

    // Afternoon break reminder
    alarms.push({
      time: "14:30",
      label: "🧘 Mindful Break Time",
      type: "break"
    });

    // Evening wind-down
    alarms.push({
      time: "21:30",
      label: "🌙 Wind Down & Reflect",
      type: "reflection"
    });

    return alarms;
  }

  static analyzeProductivityPattern(): {
    pattern: string;
    recommendations: string[];
    nextGoal: string;
  } {
    const sessions = this.getFocusSessions();
    const lastWeek = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    let pattern = "building";
    const recommendations: string[] = [];
    let nextGoal = "Complete 3 focus sessions today";

    if (lastWeek.length === 0) {
      pattern = "starting";
      recommendations.push("Start with 25-minute Pomodoro sessions");
      recommendations.push("Set a consistent wake-up time for better focus");
    } else if (lastWeek.length < 5) {
      pattern = "developing";
      recommendations.push("Try to maintain daily focus sessions");
      recommendations.push("Experiment with different session lengths");
      nextGoal = "Achieve 5 focus sessions this week";
    } else {
      pattern = "established";
      recommendations.push("Consider longer deep work sessions");
      recommendations.push("Track your peak productivity hours");
      nextGoal = "Maintain your productivity streak";
    }

    return { pattern, recommendations, nextGoal };
  }
}
