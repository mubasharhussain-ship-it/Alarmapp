import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MathPuzzleGenerator } from '@/lib/mathPuzzleGenerator';
import { MotionDetector } from '@/lib/motionDetector';
import { Alarm } from '@shared/schema';

interface AlarmDismissalChallengeProps {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: () => void;
}

export function AlarmDismissalChallenge({ alarm, onDismiss, onSnooze }: AlarmDismissalChallengeProps) {
  const [mathProblem, setMathProblem] = useState<{ question: string; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [shakeProgress, setShakeProgress] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (alarm.dismissMethod === 'math') {
      const problem = MathPuzzleGenerator.generatePuzzle(alarm.mathDifficulty);
      setMathProblem({ question: problem.question, answer: problem.answer });
    }

    if (alarm.dismissMethod === 'shake') {
      const detector = new MotionDetector();
      detector.startListening(() => {
        setShakeProgress(prev => {
          const newProgress = Math.min(prev + 20, 100);
          if (newProgress >= 100) {
            onDismiss();
          }
          return newProgress;
        });
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 100);
      });

      return () => detector.stopListening();
    }
  }, [alarm.dismissMethod, alarm.mathDifficulty, onDismiss]);

  const handleMathSubmit = () => {
    if (!mathProblem) return;
    
    const answer = parseInt(userAnswer);
    if (answer === mathProblem.answer) {
      onDismiss();
    } else {
      setError('Incorrect answer. Try again!');
      setUserAnswer('');
      // Generate new problem for security
      const newProblem = MathPuzzleGenerator.generatePuzzle(alarm.mathDifficulty);
      setMathProblem({ question: newProblem.question, answer: newProblem.answer });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMathSubmit();
    }
  };

  if (alarm.dismissMethod === 'tap') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Tap to Dismiss</h3>
          <p className="text-sm text-muted-foreground">Simple tap to turn off the alarm</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={onDismiss} className="flex-1" size="lg" data-testid="dismiss-alarm">
            Dismiss
          </Button>
          {alarm.snoozeEnabled && (
            <Button onClick={onSnooze} variant="outline" className="flex-1" size="lg" data-testid="snooze-alarm">
              Snooze
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (alarm.dismissMethod === 'math' && mathProblem) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Solve to Dismiss</h3>
          <p className="text-sm text-muted-foreground">Complete the math problem to turn off the alarm</p>
        </div>

        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-foreground mb-4" data-testid="math-question">
            {mathProblem.question}
          </div>
          
          <div className="flex gap-2 mb-4">
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Your answer"
              className="text-center text-lg"
              autoFocus
              data-testid="math-answer-input"
            />
            <Button onClick={handleMathSubmit} data-testid="math-submit">
              Submit
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-2" data-testid="math-error">
              {error}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Difficulty: {alarm.mathDifficulty}
          </div>
        </Card>

        {alarm.snoozeEnabled && (
          <Button onClick={onSnooze} variant="outline" className="w-full" size="lg" data-testid="snooze-alarm">
            Snooze (Skip Challenge)
          </Button>
        )}
      </div>
    );
  }

  if (alarm.dismissMethod === 'shake') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Shake to Dismiss</h3>
          <p className="text-sm text-muted-foreground">Shake your device vigorously to turn off the alarm</p>
        </div>

        <Card className="p-6 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="absolute inset-0 bg-muted rounded-full"></div>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-200"
              style={{ 
                clipPath: `inset(${100 - shakeProgress}% 0 0 0)`,
                transform: isShaking ? 'scale(1.1)' : 'scale(1)'
              }}
              data-testid="shake-progress"
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {Math.round(shakeProgress)}%
              </span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {isShaking ? '🔥 Keep shaking!' : '📱 Start shaking your device'}
          </div>
        </Card>

        {alarm.snoozeEnabled && (
          <Button onClick={onSnooze} variant="outline" className="w-full" size="lg" data-testid="snooze-alarm">
            Snooze (Skip Challenge)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">Alarm Ringing</h3>
        <p className="text-sm text-muted-foreground">Dismiss method not configured</p>
      </div>
      
      <div className="flex gap-3">
        <Button onClick={onDismiss} className="flex-1" size="lg" data-testid="dismiss-alarm">
          Dismiss
        </Button>
        {alarm.snoozeEnabled && (
          <Button onClick={onSnooze} variant="outline" className="flex-1" size="lg" data-testid="snooze-alarm">
            Snooze
          </Button>
        )}
      </div>
    </div>
  );
}