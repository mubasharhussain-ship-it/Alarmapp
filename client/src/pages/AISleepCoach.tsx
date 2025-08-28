
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AISleepOptimization } from '@/lib/aiSleepOptimization';

export default function AISleepCoach() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = AISleepOptimization.analyzeSleepPattern();
      setAnalysis(result);
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateAnalysis();
  }, []);

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
          <h1 className="text-xl font-medium text-foreground">AI Sleep Coach</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-6">
          <div className="text-center mb-6">
            <span className="material-icons text-6xl text-primary mb-4">psychology</span>
            <h2 className="text-2xl font-semibold mb-2">Your AI Sleep Coach</h2>
            <p className="text-muted-foreground">Get personalized insights and recommendations for better sleep</p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-muted-foreground animate-spin">refresh</span>
              <p className="mt-2 text-muted-foreground">Analyzing your sleep patterns...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="material-icons text-primary">bedtime</span>
                    Optimal Sleep Schedule
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Based on your patterns:</p>
                  <div className="space-y-1">
                    <p><strong>Bedtime:</strong> {analysis.recommendations?.optimalBedtime || '22:30'}</p>
                    <p><strong>Wake Time:</strong> {analysis.recommendations?.optimalWakeTime || '06:30'}</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="material-icons text-primary">analytics</span>
                    Sleep Quality Score
                  </h3>
                  <div className="text-3xl font-bold text-primary">
                    {analysis.overallScore || 85}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.overallScore > 80 ? 'Excellent' : analysis.overallScore > 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </Card>
              </div>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="material-icons text-primary">lightbulb</span>
                  AI Recommendations
                </h3>
                <div className="space-y-2">
                  {(analysis.insights || [
                    'Maintain consistent sleep schedule',
                    'Create a relaxing bedtime routine',
                    'Limit screen time before bed'
                  ]).map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="material-icons text-sm text-primary mt-0.5">check_circle</span>
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button onClick={generateAnalysis} className="flex-1">
                  <span className="material-icons mr-2">refresh</span>
                  Refresh Analysis
                </Button>
                <Button variant="outline" className="flex-1">
                  <span className="material-icons mr-2">alarm</span>
                  Set Optimized Alarms
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No sleep data available yet</p>
              <Button onClick={generateAnalysis}>
                <span className="material-icons mr-2">analytics</span>
                Start Analysis
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
