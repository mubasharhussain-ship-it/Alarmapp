export interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  temperature: number;
  humidity: number;
  recommendation: 'earlier' | 'normal' | 'later';
}

export class WeatherService {
  private static readonly WEATHER_STORAGE_KEY = 'alarm_weather_cache';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static async getCurrentWeather(): Promise<WeatherData | null> {
    try {
      // Check cache first
      const cached = this.getCachedWeather();
      if (cached) return cached;

      // Get user's location
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // For demo purposes, simulate weather based on location and time
      const weather = this.simulateWeatherData(latitude, longitude);
      
      // Cache the result
      this.cacheWeatherData(weather);
      
      return weather;
    } catch (error) {
      console.warn('Unable to fetch weather data:', error);
      return this.getDefaultWeather();
    }
  }

  private static getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
        enableHighAccuracy: false
      });
    });
  }

  private static simulateWeatherData(lat: number, lon: number): WeatherData {
    // Simple simulation based on location and current time
    const hour = new Date().getHours();
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy'];
    
    // Simulate based on location hash and time
    const locationHash = Math.abs(Math.floor(lat * lon * 1000) % 4);
    const timeVariation = hour % 4;
    const conditionIndex = (locationHash + timeVariation) % conditions.length;
    
    const condition = conditions[conditionIndex];
    const baseTemp = 20 + (lat / 90) * 30; // Rough temperature based on latitude
    const temperature = Math.round(baseTemp + Math.random() * 10 - 5);
    const humidity = Math.round(30 + Math.random() * 40);

    let recommendation: WeatherData['recommendation'] = 'normal';
    
    // Weather-based recommendations
    if (condition === 'rainy' || condition === 'stormy') {
      recommendation = 'earlier'; // Wake up earlier on bad weather days
    } else if (condition === 'sunny' && temperature > 25) {
      recommendation = 'later'; // Sleep in on nice warm days
    }

    return { condition, temperature, humidity, recommendation };
  }

  private static getDefaultWeather(): WeatherData {
    return {
      condition: 'sunny',
      temperature: 22,
      humidity: 50,
      recommendation: 'normal'
    };
  }

  private static getCachedWeather(): WeatherData | null {
    try {
      const cached = localStorage.getItem(this.WEATHER_STORAGE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.WEATHER_STORAGE_KEY);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private static cacheWeatherData(data: WeatherData): void {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.WEATHER_STORAGE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache weather data:', error);
    }
  }

  static adjustAlarmTime(originalTime: string, weather: WeatherData): string {
    if (weather.recommendation === 'normal') return originalTime;

    const [hours, minutes] = originalTime.split(':').map(Number);
    let adjustedMinutes = hours * 60 + minutes;

    // Adjust by 15 minutes based on weather
    if (weather.recommendation === 'earlier') {
      adjustedMinutes -= 15;
    } else if (weather.recommendation === 'later') {
      adjustedMinutes += 15;
    }

    // Handle day boundaries
    if (adjustedMinutes < 0) adjustedMinutes += 24 * 60;
    if (adjustedMinutes >= 24 * 60) adjustedMinutes -= 24 * 60;

    const adjustedHours = Math.floor(adjustedMinutes / 60);
    const adjustedMins = adjustedMinutes % 60;

    return `${adjustedHours.toString().padStart(2, '0')}:${adjustedMins.toString().padStart(2, '0')}`;
  }
}