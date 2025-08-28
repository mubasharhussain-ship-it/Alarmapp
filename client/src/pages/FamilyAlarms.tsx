import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FamilyMember {
  id: string;
  name: string;
  status: 'awake' | 'sleeping' | 'snoozing';
  nextAlarm?: string;
}

export default function FamilyAlarms() {
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'John', status: 'sleeping', nextAlarm: '07:00' },
    { id: '2', name: 'Sarah', status: 'awake', nextAlarm: '06:30' },
    { id: '3', name: 'Emma', status: 'sleeping', nextAlarm: '07:30' },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sleeping': return '😴';
      case 'awake': return '😊';
      case 'snoozing': return '😪';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sleeping': return 'text-blue-600';
      case 'awake': return 'text-green-600';
      case 'snoozing': return 'text-orange-600';
      default: return 'text-gray-600';
    }
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
          <h1 className="text-xl font-medium text-foreground">Family Alarms</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Family Status</h2>
          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getStatusIcon(member.status)}</div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className={`text-sm capitalize ${getStatusColor(member.status)}`}>
                        {member.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {member.nextAlarm && (
                      <p className="text-sm text-muted-foreground">
                        Next: {member.nextAlarm}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Shared Alarms</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Family Wake Up</p>
                <p className="text-sm text-muted-foreground">07:00 AM • Weekdays</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Weekend Sleep In</p>
                <p className="text-sm text-muted-foreground">09:00 AM • Weekends</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
          <Button className="w-full mt-4">Create Shared Alarm</Button>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <span className="material-icons mb-1">schedule</span>
            <span className="text-sm">Family Schedule</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <span className="material-icons mb-1">settings</span>
            <span className="text-sm">Group Settings</span>
          </Button>
        </div>
      </main>
    </div>
  );
}