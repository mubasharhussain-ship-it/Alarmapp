
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LocationAlarms() {
  const [locations, setLocations] = useState([
    { id: 1, name: 'Home', address: '123 Main St', alarms: 2 },
    { id: 2, name: 'Work', address: '456 Office Blvd', alarms: 1 },
  ]);

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
          <h1 className="text-xl font-medium text-foreground">Location-Based Alarms</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Your Locations</h2>
            <Button>Add Location</Button>
          </div>
          
          <div className="space-y-4">
            {locations.map((location) => (
              <Card key={location.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-primary">location_on</span>
                    <div>
                      <h3 className="font-medium">{location.name}</h3>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{location.alarms} alarms</p>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">How it works</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Set different alarm schedules for different locations</p>
            <p>• Automatically activate when you arrive at a location</p>
            <p>• Perfect for work schedules vs. weekend routines</p>
          </div>
        </Card>
      </main>
    </div>
  );
}
