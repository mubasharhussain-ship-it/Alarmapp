
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';

interface WorldClock {
  id: string;
  city: string;
  timezone: string;
  time: string;
  date: string;
}

const popularTimezones = [
  { city: 'New York', timezone: 'America/New_York' },
  { city: 'Los Angeles', timezone: 'America/Los_Angeles' },
  { city: 'London', timezone: 'Europe/London' },
  { city: 'Paris', timezone: 'Europe/Paris' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo' },
  { city: 'Sydney', timezone: 'Australia/Sydney' },
  { city: 'Dubai', timezone: 'Asia/Dubai' },
  { city: 'Singapore', timezone: 'Asia/Singapore' },
];

export default function WorldClock() {
  const { theme } = useTheme();
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load saved world clocks from localStorage
    const saved = localStorage.getItem('worldClocks');
    if (saved) {
      setWorldClocks(JSON.parse(saved));
    } else {
      // Add a few default clocks
      const defaultClocks = [
        { city: 'New York', timezone: 'America/New_York' },
        { city: 'London', timezone: 'Europe/London' },
        { city: 'Tokyo', timezone: 'Asia/Tokyo' },
      ].map(tz => ({
        id: Math.random().toString(36).substr(2, 9),
        ...tz,
        time: '',
        date: ''
      }));
      setWorldClocks(defaultClocks);
    }
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      setWorldClocks(clocks => 
        clocks.map(clock => {
          const now = new Date();
          const timeFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: clock.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: clock.timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          
          return {
            ...clock,
            time: timeFormatter.format(now),
            date: dateFormatter.format(now)
          };
        })
      );
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('worldClocks', JSON.stringify(worldClocks));
  }, [worldClocks]);

  const addClock = (city: string, timezone: string) => {
    const newClock: WorldClock = {
      id: Math.random().toString(36).substr(2, 9),
      city,
      timezone,
      time: '',
      date: ''
    };
    setWorldClocks(prev => [...prev, newClock]);
  };

  const removeClock = (id: string) => {
    setWorldClocks(prev => prev.filter(clock => clock.id !== id));
  };

  const filteredTimezones = popularTimezones.filter(tz => 
    tz.city.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !worldClocks.some(clock => clock.timezone === tz.timezone)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={() => window.history.back()}
              data-testid="back-button"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h1 className="text-xl font-medium text-foreground">
              World Clock
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Current Clocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {worldClocks.map((clock) => (
            <Card key={clock.id} className="p-4 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 p-1 h-auto"
                onClick={() => removeClock(clock.id)}
              >
                <span className="material-icons text-lg">close</span>
              </Button>
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground mb-1">
                  {clock.city}
                </h3>
                <div className="text-2xl font-light text-primary mb-1">
                  {clock.time}
                </div>
                <div className="text-sm text-muted-foreground">
                  {clock.date}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add New Clock */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">add</span>
            Add World Clock
          </h2>
          
          <Input
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredTimezones.map((tz) => (
              <Button
                key={tz.timezone}
                variant="outline"
                onClick={() => addClock(tz.city, tz.timezone)}
                className="justify-start"
              >
                <span className="material-icons mr-2">public</span>
                {tz.city}
              </Button>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
