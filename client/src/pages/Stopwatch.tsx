
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Lap {
  id: number;
  time: number;
  lapTime: number;
}

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastLapTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = () => {
    startTimeRef.current = Date.now() - time;
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setTime(0);
    setIsRunning(false);
    setLaps([]);
    lastLapTimeRef.current = 0;
  };

  const lap = () => {
    if (isRunning) {
      const currentTime = time;
      const lapTime = currentTime - lastLapTimeRef.current;
      const newLap: Lap = {
        id: laps.length + 1,
        time: currentTime,
        lapTime: lapTime
      };
      setLaps(prev => [newLap, ...prev]);
      lastLapTimeRef.current = currentTime;
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getFastestLap = () => {
    if (laps.length === 0) return null;
    return Math.min(...laps.map(lap => lap.lapTime));
  };

  const getSlowestLap = () => {
    if (laps.length === 0) return null;
    return Math.max(...laps.map(lap => lap.lapTime));
  };

  const fastestLapTime = getFastestLap();
  const slowestLapTime = getSlowestLap();

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
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h1 className="text-xl font-medium text-foreground">
              Stopwatch
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Stopwatch Display */}
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl font-light text-foreground mb-8 font-mono">
              {formatTime(time)}
            </div>
            
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <>
                  <Button
                    onClick={start}
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    <span className="material-icons mr-2">play_arrow</span>
                    Start
                  </Button>
                  {time > 0 && (
                    <Button
                      onClick={reset}
                      variant="outline"
                      size="lg"
                      className="px-8 py-3 text-lg"
                    >
                      <span className="material-icons mr-2">refresh</span>
                      Reset
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    onClick={stop}
                    variant="destructive"
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    <span className="material-icons mr-2">pause</span>
                    Stop
                  </Button>
                  <Button
                    onClick={lap}
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    <span className="material-icons mr-2">flag</span>
                    Lap
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Lap Times */}
        {laps.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <span className="material-icons text-primary">list</span>
              Lap Times ({laps.length})
            </h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {laps.map((lap) => (
                <div
                  key={lap.id}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    lap.lapTime === fastestLapTime && laps.length > 1
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/20'
                      : lap.lapTime === slowestLapTime && laps.length > 1
                      ? 'border-red-500 bg-red-100 dark:bg-red-900/20'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-12">
                      Lap {lap.id}
                    </span>
                    <span className="font-mono text-foreground">
                      {formatTime(lap.lapTime)}
                    </span>
                    {lap.lapTime === fastestLapTime && laps.length > 1 && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        FASTEST
                      </span>
                    )}
                    {lap.lapTime === slowestLapTime && laps.length > 1 && (
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                        SLOWEST
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    {formatTime(lap.time)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
