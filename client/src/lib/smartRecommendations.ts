
interface SleepPattern {
  bedtime: string;
  wakeTime: string;
  quality: number;
  date: string;
}

export class SmartRecommendations {
  private static readonly STORAGE_KEY = 'sleep_patterns';

  static recordSleepPattern(pattern: SleepPattern): void {
    const patterns = this.getSleepPatterns();
    patterns.push(pattern);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredPatterns = patterns.filter(p => 
      new Date(p.date) >= thirtyDaysAgo
    );
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPatterns));
  }

  static getSleepPatterns(): SleepPattern[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getOptimalBedtime(): string {
    const patterns = this.getSleepPatterns();
    if (patterns.length < 3) return '22:00';

    // Find patterns with quality > 80
    const goodPatterns = patterns.filter(p => p.quality > 80);
    if (goodPatterns.length === 0) return '22:00';

    // Calculate average bedtime for good quality sleep
    const totalMinutes = goodPatterns.reduce((sum, pattern) => {
      const [hours, minutes] = pattern.bedtime.split(':').map(Number);
      return sum + (hours * 60 + minutes);
    }, 0);

    const avgMinutes = Math.round(totalMinutes / goodPatterns.length);
    const hours = Math.floor(avgMinutes / 60);
    const mins = avgMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static getPersonalizedRecommendations(): string[] {
    const patterns = this.getSleepPatterns();
    const recommendations: string[] = [];

    if (patterns.length < 7) {
      recommendations.push("Track your sleep for a week to get personalized insights");
      return recommendations;
    }

    const avgQuality = patterns.reduce((sum, p) => sum + p.quality, 0) / patterns.length;
    
    if (avgQuality < 70) {
      recommendations.push("Consider going to bed 30 minutes earlier for better sleep quality");
    }

    const inconsistentBedtimes = this.calculateBedtimeVariance(patterns) > 60;
    if (inconsistentBedtimes) {
      recommendations.push("Try to maintain a consistent bedtime for better sleep rhythm");
    }

    const weekendPatterns = patterns.filter(p => {
      const day = new Date(p.date).getDay();
      return day === 0 || day === 6;
    });

    if (weekendPatterns.length > 0) {
      const weekdayAvg = this.getAverageBedtime(patterns.filter(p => {
        const day = new Date(p.date).getDay();
        return day >= 1 && day <= 5;
      }));
      
      const weekendAvg = this.getAverageBedtime(weekendPatterns);
      const difference = Math.abs(weekdayAvg - weekendAvg);
      
      if (difference > 90) {
        recommendations.push("Try to keep weekend sleep schedule within 1.5 hours of weekdays");
      }
    }

    return recommendations;
  }

  private static calculateBedtimeVariance(patterns: SleepPattern[]): number {
    const bedtimes = patterns.map(p => {
      const [hours, minutes] = p.bedtime.split(':').map(Number);
      return hours * 60 + minutes;
    });

    const avg = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
    const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / bedtimes.length;
    
    return Math.sqrt(variance);
  }

  private static getAverageBedtime(patterns: SleepPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const totalMinutes = patterns.reduce((sum, pattern) => {
      const [hours, minutes] = pattern.bedtime.split(':').map(Number);
      return sum + (hours * 60 + minutes);
    }, 0);

    return totalMinutes / patterns.length;
  }
}
