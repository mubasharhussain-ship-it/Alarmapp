import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  frequency: string;
}

export default function HealthMedical() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Vitamin D', dosage: '1000 IU', times: ['08:00'], frequency: 'Daily' },
    { id: '2', name: 'Blood Pressure Med', dosage: '10mg', times: ['07:00', '19:00'], frequency: 'Twice daily' },
  ]);

  const [appointments] = useState([
    { id: '1', title: 'Doctor Checkup', date: '2024-01-15', time: '10:00' },
    { id: '2', title: 'Dental Cleaning', date: '2024-01-22', time: '14:30' },
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
          <h1 className="text-xl font-medium text-foreground">Health & Medical</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Medication Reminders</h2>
            <Button>Add Medication</Button>
          </div>

          <div className="space-y-4">
            {medications.map((med) => (
              <Card key={med.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-primary">medication</span>
                    <div>
                      <h3 className="font-medium">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                      <p className="text-xs text-muted-foreground">
                        Times: {med.times.join(', ')}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Upcoming Appointments</h2>
            <Button>Add Appointment</Button>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-primary">event</span>
                  <div>
                    <p className="font-medium">{apt.title}</p>
                    <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Remind Me</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Health Tracking</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <span className="material-icons mb-1">favorite</span>
              <span className="text-sm">Heart Rate</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="material-icons mb-1">monitor_weight</span>
              <span className="text-sm">Weight</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="material-icons mb-1">water_drop</span>
              <span className="text-sm">Hydration</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="material-icons mb-1">local_hospital</span>
              <span className="text-sm">Emergency</span>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}