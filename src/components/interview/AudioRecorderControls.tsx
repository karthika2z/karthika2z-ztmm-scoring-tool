import { useState, useEffect, useRef } from 'react';
import { AudioRecorder } from '../../utils/audioRecorder';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

interface AudioRecorderControlsProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function AudioRecorderControls({
  onRecordingComplete,
  onCancel,
  disabled = false
}: AudioRecorderControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recorderRef.current) {
        recorderRef.current.cleanup();
      }
    };
  }, []);

  const startTimer = () => {
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Check microphone permission
      const hasPermission = await AudioRecorder.checkMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone permission denied. Please enable microphone access.');
        setIsInitializing(false);
        return;
      }

      // Initialize recorder
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
        await recorderRef.current.initialize();
      }

      recorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
      setIsInitializing(false);
    } catch (err) {
      setError(`Failed to start recording: ${(err as Error).message}`);
      setIsInitializing(false);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;

    try {
      const { blob, duration } = await recorderRef.current.stop();
      stopTimer();
      setIsRecording(false);
      setIsPaused(false);
      onRecordingComplete(blob, duration);
    } catch (err) {
      setError(`Failed to stop recording: ${(err as Error).message}`);
    }
  };

  const handlePauseRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.pause();
    setIsPaused(true);
    stopTimer();
  };

  const handleResumeRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.resume();
    setIsPaused(false);
    startTimer();
  };

  const handleCancelRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.cleanup();
      recorderRef.current = null;
    }
    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    if (onCancel) onCancel();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Recording Status */}
      <div className="flex items-center justify-center space-x-4">
        <div className={cn(
          'flex items-center space-x-3 px-6 py-4 rounded-lg border-2',
          isRecording && !isPaused ? 'border-red-500 bg-red-50' :
          isPaused ? 'border-yellow-500 bg-yellow-50' :
          'border-gray-300 bg-gray-50'
        )}>
          {/* Recording Indicator */}
          {isRecording && !isPaused && (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          {isPaused && (
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          )}
          {!isRecording && (
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
          )}

          {/* Status Text */}
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {isRecording && !isPaused && 'Recording...'}
              {isPaused && 'Paused'}
              {!isRecording && 'Ready to Record'}
            </div>
            {(isRecording || isPaused) && (
              <div className="text-2xl font-mono font-bold text-gray-900 mt-1">
                {formatDuration(duration)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-3">
        {!isRecording && !isPaused && (
          <>
            <Button
              variant="primary"
              onClick={handleStartRecording}
              disabled={disabled || isInitializing}
              isLoading={isInitializing}
              loadingText="Initializing..."
              className="px-8"
            >
              🎤 Start Recording
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
            )}
          </>
        )}

        {isRecording && !isPaused && (
          <>
            <Button
              variant="secondary"
              onClick={handlePauseRecording}
              disabled={disabled}
            >
              ⏸ Pause
            </Button>
            <Button
              variant="primary"
              onClick={handleStopRecording}
              disabled={disabled}
            >
              ⏹ Stop & Submit
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelRecording}
              disabled={disabled}
            >
              ✕ Cancel
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              variant="primary"
              onClick={handleResumeRecording}
              disabled={disabled}
            >
              ▶ Resume
            </Button>
            <Button
              variant="secondary"
              onClick={handleStopRecording}
              disabled={disabled}
            >
              ⏹ Stop & Submit
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelRecording}
              disabled={disabled}
            >
              ✕ Cancel
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!isRecording && !isPaused && (
        <div className="text-center text-sm text-gray-600">
          <p>Click "Start Recording" and answer the question naturally.</p>
          <p className="mt-1">Your response will be analyzed to determine maturity level.</p>
        </div>
      )}
    </div>
  );
}
