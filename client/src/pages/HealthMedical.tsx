
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmergencyFeatures } from '@/lib/emergencyFeatures';
import { HealthIntegration } from '@/lib/healthIntegration';

export default function HealthMedical() {
  const [medications, setMedications] = useState([
    { id: 1, name: 'Vitamin D', time: '08:00', frequency: 'Daily', important: false },
    { id: 2, name: 'Blood Pressure Med', time: '18:00', frequency: 'Daily', important: true }
  ]);

  const [newMedication, setNewMedication] = useState({ name: '', time: '', frequency: 'Daily' });

  const addMedication = () => {
    if (newMedication.name && newMedication.time) {
      const newMed = {
        id: Date.now(),
        ...newMedication,
        important: false
      };
      setMedications([...medications, newMed]);
      setNewMedication({ name: '', time: '', frequency: 'Daily' });
    }
  };

  const generateHealthReport = () => {
    try {
      const report = EmergencyFeatures.generateMedicalReport();
      alert(`Health Report:\n• Total Reminders: ${report.totalReminders}\n• Missed Today: ${report.missedToday}\n• Compliance Rate: ${report.complianceRate}%`);
    } catch (error) {
      console.error('Error generating report:', error);
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
          <h1 className="text-xl font-medium text-foreground">Health & Medical</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Health Overview */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <span className="material-icons text-6xl text-primary mb-4">medical_services</span>
            <h2 className="text-2xl font-semibold mb-2">Health Hub</h2>
            <p className="text-muted-foreground">Manage medications and wellness reminders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{medications.length}</div>
              <p className="text-sm text-muted-foreground">Active Medications</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <p className="text-sm text-muted-foreground">Compliance Rate</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-sm text-muted-foreground">Missed Today</p>
            </div>
          </div>
        </Card>

        {/* Add Medication */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">add</span>
            Add Medication Reminder
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Medication name"
              value={newMedication.name}
              onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
            />
            <Input
              type="time"
              value={newMedication.time}
              onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
            />
            <select
              className="px-3 py-2 border border-border rounded-md bg-background"
              value={newMedication.frequency}
              onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
            >
              <option value="Daily">Daily</option>
              <option value="Twice Daily">Twice Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="As Needed">As Needed</option>
            </select>
          </div>
          
          <Button onClick={addMedication} className="w-full">
            <span className="material-icons mr-2">alarm</span>
            Add Reminder
          </Button>
        </Card>

        {/* Medication List */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">medication</span>
            Your Medications
          </h3>
          
          <div className="space-y-3">
            {medications.map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {med.important && (
                    <span className="material-icons text-red-500 text-sm">priority_high</span>
                  )}
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.time} • {med.frequency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <span className="material-icons">edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    <span className="material-icons">delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Health Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={generateHealthReport}>
            <span className="material-icons mr-2">assessment</span>
            Health Report
          </Button>
          <Button variant="outline">
            <span className="material-icons mr-2">local_hospital</span>
            Emergency Info
          </Button>
          <Button variant="outline">
            <span className="material-icons mr-2">favorite</span>
            Wellness Check
          </Button>
          <Button variant="outline">
            <span className="material-icons mr-2">monitor_heart</span>
            Vital Signs
          </Button>
        </div>
      </main>
    </div>
  );
}
