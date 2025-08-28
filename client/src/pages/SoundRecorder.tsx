import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { audioManager } from '@/lib/audioManager';

interface Recording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
}

export default function SoundRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingName, setRecordingName] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    // Load saved recordings from localStorage
    const saved = localStorage.getItem('customRecordings');
    if (saved) {
      const parsedRecordings = JSON.parse(saved);
      // Restore blob URLs
      const restoredRecordings = parsedRecordings.map((rec: any) => ({
        ...rec,
        url: URL.createObjectURL(new Blob([new Uint8Array(rec.arrayBuffer)], { type: 'audio/webm' }))
      }));
      setRecordings(restoredRecordings);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        if (recordingName.trim()) {
          const newRecording: Recording = {
            id: Math.random().toString(36).substr(2, 9),
            name: recordingName.trim(),
            blob,
            url,
            duration: recordingTime
          };

          setRecordings(prev => [...prev, newRecording]);
          saveRecordings([...recordings, newRecording]);
          setRecordingName('');
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const saveRecordings = async (recs: Recording[]) => {
    // Convert blobs to array buffers for storage
    const recordingsToSave = await Promise.all(
      recs.map(async (rec) => ({
        ...rec,
        arrayBuffer: Array.from(new Uint8Array(await rec.blob.arrayBuffer())),
        blob: undefined, // Remove blob from saved data
        url: undefined // Remove URL from saved data
      }))
    );
    localStorage.setItem('customRecordings', JSON.stringify(recordingsToSave));
  };

  const playRecording = (recording: Recording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(recording.url);
      audioRef.current = audio;

      audio.onended = () => setPlayingId(null);
      audio.play();
      setPlayingId(recording.id);
    }
  };

  const deleteRecording = (id: string) => {
    const updatedRecordings = recordings.filter(rec => rec.id !== id);
    setRecordings(updatedRecordings);
    saveRecordings(updatedRecordings);

    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={() => window.history.back()}
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h1 className="text-xl font-medium text-foreground">
              Record Custom Sounds
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Recording Controls */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">mic</span>
            Record New Alarm Sound
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="recording-name">Recording Name</Label>
              <Input
                id="recording-name"
                placeholder="Enter a name for your recording..."
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
                disabled={isRecording}
              />
            </div>

            {isRecording && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">
                  {formatTime(recordingTime)}
                </div>
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <span className="material-icons animate-pulse">fiber_manual_record</span>
                  Recording...
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={!recordingName.trim()}
                  className="flex items-center gap-2"
                >
                  <span className="material-icons">mic</span>
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <span className="material-icons">stop</span>
                  Stop Recording
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Recordings List */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">library_music</span>
            Your Recordings
          </h2>

          {recordings.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-6xl text-muted-foreground mb-4">music_off</span>
              <p className="text-muted-foreground">No custom recordings yet</p>
              <p className="text-sm text-muted-foreground">Record your first custom alarm sound above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playRecording(recording)}
                      className="p-2"
                    >
                      <span className="material-icons">
                        {playingId === recording.id ? 'pause' : 'play_arrow'}
                      </span>
                    </Button>
                    <div>
                      <div className="font-medium text-foreground">
                        {recording.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Duration: {formatTime(recording.duration)}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecording(recording.id)}
                    className="p-2 text-destructive hover:text-destructive"
                  >
                    <span className="material-icons">delete</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}