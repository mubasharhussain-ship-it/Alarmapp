
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function FamilyAlarms() {
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'Mom', avatar: '👩', alarms: 3, status: 'online' },
    { id: 2, name: 'Dad', avatar: '👨', alarms: 2, status: 'online' },
    { id: 3, name: 'Emma', avatar: '👧', alarms: 1, status: 'offline' }
  ]);
  
  const [shareCode, setShareCode] = useState('FAM-2024-XY7');
  const [newMemberCode, setNewMemberCode] = useState('');

  const addFamilyMember = () => {
    if (newMemberCode.trim()) {
      // Simulate adding a family member
      const newMember = {
        id: Date.now(),
        name: 'New Member',
        avatar: '👤',
        alarms: 0,
        status: 'offline'
      };
      setFamilyMembers([...familyMembers, newMember]);
      setNewMemberCode('');
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
        {/* Family Share Code */}
        <Card className="p-6">
          <div className="text-center mb-4">
            <span className="material-icons text-4xl text-primary mb-2">family_restroom</span>
            <h2 className="text-xl font-semibold mb-2">Family Group</h2>
            <p className="text-muted-foreground">Share alarms and schedules with your family</p>
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center mb-4">
            <p className="text-sm text-muted-foreground mb-2">Your Family Code</p>
            <div className="text-2xl font-mono font-bold tracking-wider">{shareCode}</div>
            <Button variant="ghost" size="sm" className="mt-2">
              <span className="material-icons mr-2">content_copy</span>
              Copy Code
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter family code"
              value={newMemberCode}
              onChange={(e) => setNewMemberCode(e.target.value)}
            />
            <Button onClick={addFamilyMember}>
              <span className="material-icons mr-2">person_add</span>
              Join
            </Button>
          </div>
        </Card>

        {/* Family Members */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">people</span>
            Family Members ({familyMembers.length})
          </h3>
          
          <div className="space-y-3">
            {familyMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{member.avatar}</div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.alarms} active alarms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs text-muted-foreground capitalize">
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Shared Alarms */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">share</span>
            Shared Alarms
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Family Breakfast</p>
                <p className="text-sm text-muted-foreground">08:00 • Daily • Shared by Mom</p>
              </div>
              <Button variant="ghost" size="sm">
                <span className="material-icons">notifications</span>
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Movie Night</p>
                <p className="text-sm text-muted-foreground">19:30 • Fridays • Shared by Dad</p>
              </div>
              <Button variant="ghost" size="sm">
                <span className="material-icons">notifications</span>
              </Button>
            </div>
          </div>
          
          <Button className="w-full mt-4">
            <span className="material-icons mr-2">add</span>
            Create Shared Alarm
          </Button>
        </Card>

        {/* Quick Actions */}
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
