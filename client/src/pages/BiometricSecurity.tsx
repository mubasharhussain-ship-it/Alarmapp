
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BiometricAuth } from '@/lib/biometricAuth';

export default function BiometricSecurity() {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [secureAlarms, setSecureAlarms] = useState([
    { id: 1, name: 'Work Meeting', time: '09:00', protected: true },
    { id: 2, name: 'Important Call', time: '14:30', protected: true }
  ]);

  const enrollBiometric = async () => {
    try {
      const result = await BiometricAuth.enrollBiometric();
      if (result.success) {
        setIsEnrolled(true);
        alert('Biometric enrollment successful!');
      } else {
        alert('Enrollment failed: ' + result.error);
      }
    } catch (error) {
      alert('Biometric authentication not supported on this device');
    }
  };

  const authenticateUser = async () => {
    try {
      const result = await BiometricAuth.authenticateUser();
      if (result.success) {
        alert('Authentication successful!');
      } else {
        alert('Authentication failed: ' + result.error);
      }
    } catch (error) {
      alert('Authentication error: ' + error);
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
          <h1 className="text-xl font-medium text-foreground">Biometric Security</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Security Status */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <span className="material-icons text-6xl text-primary mb-4">fingerprint</span>
            <h2 className="text-2xl font-semibold mb-2">Secure Your Alarms</h2>
            <p className="text-muted-foreground">Use biometric authentication to protect important alarms</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`w-4 h-4 rounded-full ${isEnrolled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              {isEnrolled ? 'Biometric Security Enabled' : 'Biometric Security Disabled'}
            </span>
          </div>

          {!isEnrolled ? (
            <Button onClick={enrollBiometric} className="w-full" size="lg">
              <span className="material-icons mr-2">fingerprint</span>
              Enable Biometric Security
            </Button>
          ) : (
            <div className="space-y-3">
              <Button onClick={authenticateUser} className="w-full">
                <span className="material-icons mr-2">verified</span>
                Test Authentication
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsEnrolled(false)}
              >
                <span className="material-icons mr-2">no_encryption</span>
                Disable Security
              </Button>
            </div>
          )}
        </Card>

        {/* Security Features */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">security</span>
            Security Features
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary">fingerprint</span>
                <div>
                  <p className="font-medium">Fingerprint Authentication</p>
                  <p className="text-sm text-muted-foreground">Unlock with your fingerprint</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${isEnrolled ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary">face</span>
                <div>
                  <p className="font-medium">Face Recognition</p>
                  <p className="text-sm text-muted-foreground">Unlock with facial recognition</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary">lock</span>
                <div>
                  <p className="font-medium">Secure Alarm Dismissal</p>
                  <p className="text-sm text-muted-foreground">Require auth to dismiss important alarms</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${isEnrolled ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
          </div>
        </Card>

        {/* Protected Alarms */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">shield</span>
            Protected Alarms ({secureAlarms.length})
          </h3>
          
          <div className="space-y-3">
            {secureAlarms.map((alarm) => (
              <div key={alarm.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-orange-500">verified_user</span>
                  <div>
                    <p className="font-medium">{alarm.name}</p>
                    <p className="text-sm text-muted-foreground">{alarm.time} • Biometric Protected</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <span className="material-icons">settings</span>
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            <span className="material-icons mr-2">add_moderator</span>
            Add Protected Alarm
          </Button>
        </Card>

        {/* Privacy Info */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="material-icons text-blue-600 mt-1">info</span>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Privacy & Security</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your biometric data is stored securely on your device and never transmitted to our servers. 
                You can disable biometric security at any time.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
