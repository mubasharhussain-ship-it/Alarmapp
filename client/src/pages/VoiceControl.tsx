
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function VoiceControl() {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            onClick={() => window.history.back()}
          >
            <span className="material-icons">arrow_back</span>
          </Button>
          <h1 className="text-xl font-medium text-foreground">Voice Control</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6 text-center">
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${isListening ? 'bg-red-100 border-red-500' : 'bg-muted border-border'} border-4`}>
            <span className={`material-icons text-4xl ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}>
              {isListening ? 'mic' : 'mic_off'}
            </span>
          </div>
          
          <h2 className="text-lg font-medium mb-2">
            {isListening ? 'Listening...' : 'Voice Commands'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {isListening ? 'Say your command now' : 'Tap to start voice control'}
          </p>

          <Button onClick={toggleListening} size="lg">
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Available Commands</h3>
          <div className="space-y-2 text-sm">
            <p>• "Set alarm for 7 AM"</p>
            <p>• "Turn off all alarms"</p>
            <p>• "Snooze for 10 minutes"</p>
            <p>• "What time is it?"</p>
          </div>
        </Card>
      </main>
    </div>
  );
}
