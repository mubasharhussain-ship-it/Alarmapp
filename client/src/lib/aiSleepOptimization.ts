
export interface SleepDataPoint {
  date: string;
  bedtime: string;
  wakeTime: string;
  sleepDuration: number;
  sleepQuality: number;
  mood: number;
  energy: number;
  weather: string;
  caffeine: number;
  exercise: boolean;
  screenTime: number;
  stress: number;
}

export interface SleepPrediction {
  optimalBedtime: string;
  optimalWakeTime: string;
  predictedQuality: number;
  confidence: number;
  factors: Array<{ factor: string; impact: number; recommendation: string }>;
}

export interface SleepInsight {
  type: 'pattern' | 'correlation' | 'recommendation' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export class AISleepOptimization {
  private static readonly SLEEP_DATA_KEY = 'ai_sleep_data';
  private static readonly INSIGHTS_KEY = 'sleep_insights';

  static addSleepData(data: Omit<SleepDataPoint, 'date'>): void {
    const sleepData = this.getSleepData();
    const newData: SleepDataPoint = {
      ...data,
      date: new Date().toISOString().split('T')[0]
    };
    
    sleepData.push(newData);
    
    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const filtered = sleepData.filter(d => 
      new Date(d.date) >= ninetyDaysAgo
    );
    
    localStorage.setItem(this.SLEEP_DATA_KEY, JSON.stringify(filtered));
    
    // Generate new insights
    this.generateInsights();
  }

  static getSleepData(): SleepDataPoint[] {
    const stored = localStorage.getItem(this.SLEEP_DATA_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static predictOptimalSleep(targetDate: string = new Date().toISOString().split('T')[0]): SleepPrediction {
    const data = this.getSleepData();
    
    if (data.length < 7) {
      return {
        optimalBedtime: '22:30',
        optimalWakeTime: '07:00',
        predictedQuality: 7.5,
        confidence: 0.3,
        factors: [
          {
            factor: 'Insufficient Data',
            impact: 0,
            recommendation: 'Track sleep for at least a week for accurate predictions'
          }
        ]
      };
    }

    // Simple ML-like analysis
    const analysis = this.analyzePatterns(data);
    const optimalTimes = this.calculateOptimalTimes(data, analysis);
    const factors = this.identifyKeyFactors(data);

    return {
      optimalBedtime: optimalTimes.bedtime,
      optimalWakeTime: optimalTimes.wakeTime,
      predictedQuality: analysis.averageQuality,
      confidence: Math.min(data.length / 30, 1), // Higher confidence with more data
      factors
    };
  }

  private static analyzePatterns(data: SleepDataPoint[]): {
    averageQuality: number;
    bestBedtimeWindow: { start: string; end: string };
    optimalDuration: number;
  } {
    const sortedByQuality = [...data].sort((a, b) => b.sleepQuality - a.sleepQuality);
    const topQuartile = sortedByQuality.slice(0, Math.ceil(data.length * 0.25));
    
    const averageQuality = data.reduce((sum, d) => sum + d.sleepQuality, 0) / data.length;
    
    // Find best bedtime window from top quality sleeps
    const bestBedtimes = topQuartile.map(d => {
      const [hours, minutes] = d.bedtime.split(':').map(Number);
      return hours * 60 + minutes;
    });
    
    const avgBestBedtime = bestBedtimes.reduce((sum, time) => sum + time, 0) / bestBedtimes.length;
    const startTime = Math.max(0, avgBestBedtime - 30);
    const endTime = Math.min(24 * 60, avgBestBedtime + 30);
    
    const optimalDuration = topQuartile.reduce((sum, d) => sum + d.sleepDuration, 0) / topQuartile.length;

    return {
      averageQuality,
      bestBedtimeWindow: {
        start: this.minutesToTime(startTime),
        end: this.minutesToTime(endTime)
      },
      optimalDuration
    };
  }

  private static calculateOptimalTimes(data: SleepDataPoint[], analysis: any): {
    bedtime: string;
    wakeTime: string;
  } {
    // Calculate based on best performing sleep patterns
    const bestBedtimeMinutes = this.timeToMinutes(analysis.bestBedtimeWindow.start) + 15;
    const optimalWakeMinutes = bestBedtimeMinutes + analysis.optimalDuration;

    return {
      bedtime: this.minutesToTime(bestBedtimeMinutes),
      wakeTime: this.minutesToTime(optimalWakeMinutes % (24 * 60))
    };
  }

  private static identifyKeyFactors(data: SleepDataPoint[]): Array<{ factor: string; impact: number; recommendation: string }> {
    const factors: Array<{ factor: string; impact: number; recommendation: string }> = [];
    
    // Analyze caffeine impact
    const caffeineCorrelation = this.calculateCorrelation(
      data.map(d => d.caffeine),
      data.map(d => d.sleepQuality)
    );
    
    if (Math.abs(caffeineCorrelation) > 0.3) {
      factors.push({
        factor: 'Caffeine Intake',
        impact: caffeineCorrelation,
        recommendation: caffeineCorrelation < 0 ? 
          'Reduce caffeine intake, especially after 2 PM' : 
          'Current caffeine levels seem optimal'
      });
    }

    // Analyze exercise impact
    const exerciseData = data.filter(d => d.exercise);
    const noExerciseData = data.filter(d => !d.exercise);
    
    if (exerciseData.length > 0 && noExerciseData.length > 0) {
      const exerciseAvg = exerciseData.reduce((sum, d) => sum + d.sleepQuality, 0) / exerciseData.length;
      const noExerciseAvg = noExerciseData.reduce((sum, d) => sum + d.sleepQuality, 0) / noExerciseData.length;
      const exerciseImpact = exerciseAvg - noExerciseAvg;
      
      if (Math.abs(exerciseImpact) > 0.5) {
        factors.push({
          factor: 'Exercise',
          impact: exerciseImpact,
          recommendation: exerciseImpact > 0 ? 
            'Regular exercise improves your sleep quality significantly' :
            'Exercise timing might be affecting your sleep - try morning workouts'
        });
      }
    }

    // Analyze screen time impact
    const screenCorrelation = this.calculateCorrelation(
      data.map(d => d.screenTime),
      data.map(d => d.sleepQuality)
    );
    
    if (screenCorrelation < -0.3) {
      factors.push({
        factor: 'Screen Time',
        impact: screenCorrelation,
        recommendation: 'Reduce screen time before bed for better sleep quality'
      });
    }

    // Analyze stress impact
    const stressCorrelation = this.calculateCorrelation(
      data.map(d => d.stress),
      data.map(d => d.sleepQuality)
    );
    
    if (stressCorrelation < -0.4) {
      factors.push({
        factor: 'Stress Level',
        impact: stressCorrelation,
        recommendation: 'Practice stress reduction techniques before bedtime'
      });
    }

    return factors;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static generateInsights(): void {
    const data = this.getSleepData();
    const insights: SleepInsight[] = [];

    if (data.length < 7) {
      insights.push({
        type: 'recommendation',
        title: 'Start Tracking',
        description: 'Track your sleep for at least a week to unlock AI-powered insights and recommendations.',
        actionable: true,
        priority: 'medium'
      });
    } else {
      // Generate pattern insights
      const recentData = data.slice(-14);
      const qualityTrend = this.calculateTrend(recentData.map(d => d.sleepQuality));
      
      if (qualityTrend < -0.5) {
        insights.push({
          type: 'warning',
          title: 'Declining Sleep Quality',
          description: 'Your sleep quality has been declining over the past two weeks. Consider reviewing your sleep hygiene.',
          actionable: true,
          priority: 'high'
        });
      } else if (qualityTrend > 0.5) {
        insights.push({
          type: 'pattern',
          title: 'Improving Sleep Quality',
          description: 'Great job! Your sleep quality has been improving consistently.',
          actionable: false,
          priority: 'low'
        });
      }

      // Consistency insights
      const bedtimeVariance = this.calculateVariance(recentData.map(d => this.timeToMinutes(d.bedtime)));
      if (bedtimeVariance > 60) {
        insights.push({
          type: 'recommendation',
          title: 'Inconsistent Bedtime',
          description: 'Your bedtime varies significantly. Try to maintain a consistent sleep schedule for better quality.',
          actionable: true,
          priority: 'medium'
        });
      }

      // Weekend vs weekday analysis
      const weekendData = data.filter(d => {
        const day = new Date(d.date).getDay();
        return day === 0 || day === 6;
      });
      
      const weekdayData = data.filter(d => {
        const day = new Date(d.date).getDay();
        return day >= 1 && day <= 5;
      });

      if (weekendData.length > 0 && weekdayData.length > 0) {
        const weekendAvgQuality = weekendData.reduce((sum, d) => sum + d.sleepQuality, 0) / weekendData.length;
        const weekdayAvgQuality = weekdayData.reduce((sum, d) => sum + d.sleepQuality, 0) / weekdayData.length;
        
        if (weekendAvgQuality - weekdayAvgQuality > 1) {
          insights.push({
            type: 'correlation',
            title: 'Weekend Sleep Advantage',
            description: 'You sleep significantly better on weekends. Consider adjusting your weekday routine.',
            actionable: true,
            priority: 'medium'
          });
        }
      }
    }

    localStorage.setItem(this.INSIGHTS_KEY, JSON.stringify(insights));
  }

  private static calculateTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  static getInsights(): SleepInsight[] {
    const stored = localStorage.getItem(this.INSIGHTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static exportSleepData(): string {
    const data = this.getSleepData();
    const insights = this.getInsights();
    
    const exportData = {
      sleepData: data,
      insights: insights,
      exportDate: new Date().toISOString(),
      totalDays: data.length
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}
