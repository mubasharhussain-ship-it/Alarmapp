
export interface HealthMetrics {
  heartRate?: number;
  steps?: number;
  sleepQuality?: number;
  stressLevel?: number;
  timestamp: Date;
}

export interface SleepPhase {
  phase: 'light' | 'deep' | 'rem' | 'awake';
  duration: number;
  timestamp: Date;
}

export class HealthIntegration {
  private static readonly HEALTH_DATA_KEY = 'health_metrics';
  private static readonly SLEEP_PHASES_KEY = 'sleep_phases';

  static async requestHealthPermissions(): Promise<boolean> {
    try {
      // Check for Web Bluetooth API for heart rate monitors
      if ('bluetooth' in navigator) {
        await navigator.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }],
          optionalServices: ['battery_service']
        });
        return true;
      }
    } catch (error) {
      console.log('Health permissions not granted:', error);
    }
    return false;
  }

  static async getHeartRate(): Promise<number | null> {
    try {
      if ('bluetooth' in navigator) {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }]
        });
        
        const server = await device.gatt?.connect();
        const service = await server?.getPrimaryService('heart_rate');
        const characteristic = await service?.getCharacteristic('heart_rate_measurement');
        
        return new Promise((resolve) => {
          characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value;
            const heartRate = value.getUint16(1, true);
            resolve(heartRate);
          });
          characteristic?.startNotifications();
        });
      }
    } catch (error) {
      console.error('Heart rate reading failed:', error);
    }
    return null;
  }

  static recordHealthMetrics(metrics: Omit<HealthMetrics, 'timestamp'>): void {
    const healthData = this.getHealthData();
    const newMetrics: HealthMetrics = {
      ...metrics,
      timestamp: new Date()
    };
    
    healthData.push(newMetrics);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = healthData.filter(h => h.timestamp >= thirtyDaysAgo);
    localStorage.setItem(this.HEALTH_DATA_KEY, JSON.stringify(filtered));
  }

  static getHealthData(): HealthMetrics[] {
    const stored = localStorage.getItem(this.HEALTH_DATA_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static analyzeSleepPattern(): { 
    averageSleepQuality: number; 
    sleepTrend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
  } {
    const data = this.getHealthData().slice(-14); // Last 14 days
    
    if (data.length < 7) {
      return {
        averageSleepQuality: 0,
        sleepTrend: 'stable',
        recommendations: ['Track sleep for at least a week for insights']
      };
    }

    const avgQuality = data.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / data.length;
    
    const firstWeek = data.slice(0, 7);
    const secondWeek = data.slice(7, 14);
    
    const firstWeekAvg = firstWeek.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / firstWeek.length;
    const secondWeekAvg = secondWeek.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / secondWeek.length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondWeekAvg > firstWeekAvg + 5) trend = 'improving';
    else if (secondWeekAvg < firstWeekAvg - 5) trend = 'declining';

    const recommendations = this.generateHealthRecommendations(data);

    return { averageSleepQuality: avgQuality, sleepTrend: trend, recommendations };
  }

  private static generateHealthRecommendations(data: HealthMetrics[]): string[] {
    const recommendations: string[] = [];
    
    const avgHeartRate = data.reduce((sum, d) => sum + (d.heartRate || 0), 0) / data.length;
    const avgStress = data.reduce((sum, d) => sum + (d.stressLevel || 0), 0) / data.length;
    
    if (avgHeartRate > 80) {
      recommendations.push('Consider relaxation techniques before bed to lower heart rate');
    }
    
    if (avgStress > 7) {
      recommendations.push('High stress levels detected. Try meditation or deep breathing');
    }
    
    const lowQualityDays = data.filter(d => (d.sleepQuality || 0) < 6).length;
    if (lowQualityDays > data.length / 2) {
      recommendations.push('Consider adjusting sleep environment for better quality');
    }

    return recommendations;
  }

  static estimateOptimalWakeTime(currentSleepPhase: SleepPhase): string {
    const now = new Date();
    let optimalTime = new Date(now);
    
    // If in deep sleep, wait for next light sleep phase
    if (currentSleepPhase.phase === 'deep') {
      optimalTime.setMinutes(optimalTime.getMinutes() + 45); // Average time to next light phase
    } else if (currentSleepPhase.phase === 'rem') {
      optimalTime.setMinutes(optimalTime.getMinutes() + 15);
    }
    
    return `${optimalTime.getHours().toString().padStart(2, '0')}:${optimalTime.getMinutes().toString().padStart(2, '0')}`;
  }
}
