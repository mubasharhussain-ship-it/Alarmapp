
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SmartHome() {
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
          <h1 className="text-xl font-medium text-foreground">Smart Home Integration</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Connected Devices</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary">lightbulb</span>
                <span>Smart Lights</span>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary">thermostat</span>
                <span>Thermostat</span>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
