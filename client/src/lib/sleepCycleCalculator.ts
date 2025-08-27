import { SleepCycle } from '@shared/schema';

export class SleepCycleCalculator {
  private static readonly CYCLE_LENGTH = 90; // minutes
  private static readonly FALL_ASLEEP_TIME = 15; // minutes

  static calculateOptimalBedtimes(wakeTime: string): string[] {
    const [hours, minutes] = wakeTime.split(':').map(Number);
    const wakeMinutes = hours * 60 + minutes;
    
    const bedtimes: string[] = [];
    
    // Calculate for 4-6 complete sleep cycles (6-9 hours of sleep)
    for (let cycles = 4; cycles <= 6; cycles++) {
      const sleepDuration = cycles * this.CYCLE_LENGTH;
      const totalTime = sleepDuration + this.FALL_ASLEEP_TIME;
      
      let bedtimeMinutes = wakeMinutes - totalTime;
      
      // Handle previous day
      if (bedtimeMinutes < 0) {
        bedtimeMinutes += 24 * 60;
      }
      
      const bedtimeHours = Math.floor(bedtimeMinutes / 60);
      const bedtimeMins = bedtimeMinutes % 60;
      
      const timeString = `${bedtimeHours.toString().padStart(2, '0')}:${bedtimeMins.toString().padStart(2, '0')}`;
      bedtimes.push(timeString);
    }
    
    return bedtimes;
  }

  static calculateOptimalWakeTimes(bedtime: string): string[] {
    const [hours, minutes] = bedtime.split(':').map(Number);
    const bedtimeMinutes = hours * 60 + minutes + this.FALL_ASLEEP_TIME;
    
    const wakeTimes: string[] = [];
    
    // Calculate for 4-6 complete sleep cycles
    for (let cycles = 4; cycles <= 6; cycles++) {
      const sleepDuration = cycles * this.CYCLE_LENGTH;
      let wakeMinutes = bedtimeMinutes + sleepDuration;
      
      // Handle next day
      if (wakeMinutes >= 24 * 60) {
        wakeMinutes -= 24 * 60;
      }
      
      const wakeHours = Math.floor(wakeMinutes / 60);
      const wakeMins = wakeMinutes % 60;
      
      const timeString = `${wakeHours.toString().padStart(2, '0')}:${wakeMins.toString().padStart(2, '0')}`;
      wakeTimes.push(timeString);
    }
    
    return wakeTimes;
  }

  static getSleepDuration(bedtime: string, wakeTime: string): number {
    const [bedHours, bedMinutes] = bedtime.split(':').map(Number);
    const [wakeHours, wakeMins] = wakeTime.split(':').map(Number);
    
    const bedtimeMinutes = bedHours * 60 + bedMinutes;
    let wakeTimeMinutes = wakeHours * 60 + wakeMins;
    
    // Handle next day wake time
    if (wakeTimeMinutes <= bedtimeMinutes) {
      wakeTimeMinutes += 24 * 60;
    }
    
    return wakeTimeMinutes - bedtimeMinutes;
  }

  static getCycleCount(sleepDuration: number): number {
    return Math.round((sleepDuration - this.FALL_ASLEEP_TIME) / this.CYCLE_LENGTH);
  }

  static getSleepQualityScore(sleepDuration: number): { score: number; quality: string; recommendation: string } {
    const cycles = this.getCycleCount(sleepDuration);
    
    if (cycles < 4) {
      return {
        score: Math.max(0, cycles * 25),
        quality: 'Poor',
        recommendation: 'Try to get at least 6 hours of sleep for better rest.'
      };
    } else if (cycles >= 4 && cycles <= 6) {
      return {
        score: 85 + (6 - Math.abs(5 - cycles)) * 5,
        quality: 'Good',
        recommendation: 'Great sleep duration! You\'re getting complete sleep cycles.'
      };
    } else {
      return {
        score: Math.max(70, 100 - (cycles - 6) * 10),
        quality: 'Excessive',
        recommendation: 'You might be sleeping too much. Consider adjusting your schedule.'
      };
    }
  }
}