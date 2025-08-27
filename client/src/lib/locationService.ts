export interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
  country?: string;
}

export class LocationService {
  private static readonly LOCATION_STORAGE_KEY = 'alarm_location_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check cache first
      const cached = this.getCachedLocation();
      if (cached) return cached;

      // Get user's position
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // For demo purposes, simulate city/country based on coordinates
      const locationInfo = await this.getLocationInfo(latitude, longitude);

      const locationData: LocationData = {
        latitude,
        longitude,
        timezone,
        ...locationInfo
      };

      // Cache the result
      this.cacheLocationData(locationData);

      return locationData;
    } catch (error) {
      console.warn('Unable to get location:', error);
      return this.getDefaultLocation();
    }
  }

  private static getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: true
      });
    });
  }

  private static async getLocationInfo(lat: number, lon: number): Promise<{ city?: string; country?: string }> {
    // Simulate reverse geocoding based on coordinates
    // In a real app, you'd use a service like OpenStreetMap Nominatim or Google Maps
    
    const cities = [
      { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
      { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
      { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
      { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
      { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 }
    ];

    let closestCity = cities[0];
    let minDistance = this.calculateDistance(lat, lon, closestCity.lat, closestCity.lon);

    for (const city of cities) {
      const distance = this.calculateDistance(lat, lon, city.lat, city.lon);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return {
      city: closestCity.name,
      country: closestCity.country
    };
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static getDefaultLocation(): LocationData {
    return {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      city: 'Unknown',
      country: 'Unknown'
    };
  }

  private static getCachedLocation(): LocationData | null {
    try {
      const cached = localStorage.getItem(this.LOCATION_STORAGE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.LOCATION_STORAGE_KEY);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private static cacheLocationData(data: LocationData): void {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.LOCATION_STORAGE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache location data:', error);
    }
  }

  static adjustAlarmForTimezone(alarmTime: string, fromTimezone: string, toTimezone: string): string {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [hours, minutes] = alarmTime.split(':').map(Number);
      
      // Create date in from timezone
      const fromDate = new Date(`${today}T${alarmTime}:00`);
      
      // Convert to target timezone
      const toDate = new Date(fromDate.toLocaleString('en-US', { timeZone: toTimezone }));
      
      return `${toDate.getHours().toString().padStart(2, '0')}:${toDate.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.warn('Failed to adjust alarm for timezone:', error);
      return alarmTime; // Return original time if conversion fails
    }
  }

  static getTimezoneOffset(timezone: string): number {
    try {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const targetTime = new Date(utcTime + (this.getTimezoneOffsetMinutes(timezone) * 60000));
      return targetTime.getTimezoneOffset();
    } catch {
      return 0;
    }
  }

  private static getTimezoneOffsetMinutes(timezone: string): number {
    try {
      const date = new Date();
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
    } catch {
      return 0;
    }
  }

  static formatLocationString(location: LocationData): string {
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    } else if (location.city) {
      return location.city;
    } else if (location.country) {
      return location.country;
    } else {
      return 'Unknown Location';
    }
  }

  static async watchLocation(callback: (location: LocationData) => void): Promise<number | null> {
    if (!navigator.geolocation) return null;

    return navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const locationInfo = await this.getLocationInfo(latitude, longitude);

        const locationData: LocationData = {
          latitude,
          longitude,
          timezone,
          ...locationInfo
        };

        callback(locationData);
      },
      (error) => {
        console.warn('Location watch error:', error);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 600000 // 10 minutes
      }
    );
  }

  static stopWatchingLocation(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}