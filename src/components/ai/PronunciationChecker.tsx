import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AudioRecorder } from '@/services/audioRecorder';
import { PronunciationService, type PronunciationResult } from '@/services/pronunciationService';
import { PronunciationFeedback } from './PronunciationFeedback';
import {
  savePracticeSession,
  updateWordPractice,
  initDatabase,
} from '@/services/practiceDatabase';

interface PronunciationCheckerProps {
  text: string;
  documentHash?: string;
  pageNumber?: number;
  onComplete?: (result: PronunciationResult) => void;
}

export function PronunciationChecker({
  text,
  documentHash,
  pageNumber,
  onComplete,
}: PronunciationCheckerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if MediaRecorder is supported
    if (!AudioRecorder.isSupported()) {
      setError('Audio recording is not supported in your browser');
    }

    return () => {
      // Cleanup
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop().catch(console.error);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (synthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setResult(null);
      setRecordingDuration(0);

      // Create new recorder
      audioRecorderRef.current = new AudioRecorder();

      // Start recording
      await audioRecorderRef.current.start({
        sampleRate: 16000, // 16kHz for Whisper
      });

      setIsRecording(true);

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        if (audioRecorderRef.current) {
          setRecordingDuration(audioRecorderRef.current.getDuration());
        }
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!audioRecorderRef.current) {
        throw new Error('No active recording');
      }

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setIsRecording(false);
      setIsProcessing(true);

      const startTime = Date.now();

      // Stop recording and get audio blob
      const recording = await audioRecorderRef.current.stop();

      // Convert to WAV for Whisper compatibility
      const wavBlob = await AudioRecorder.convertToWav(recording.blob);

      // In production, send to Whisper service
      // For now, use Web Speech API for demonstration
      const transcribedText = await transcribeAudio(wavBlob);

      // Compare pronunciation
      const pronunciationResult = PronunciationService.comparePronunciation(
        transcribedText,
        text,
        70 // 70% threshold
      );

      setResult(pronunciationResult);

      // Save practice data if document info is available
      if (documentHash && pageNumber !== undefined) {
        await savePracticeData(pronunciationResult, startTime);
      }

      onComplete?.(pronunciationResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
      setError(errorMessage);
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
      audioRecorderRef.current = null;
    }
  };

  const savePracticeData = async (result: PronunciationResult, startTime: number) => {
    if (!documentHash || pageNumber === undefined) return;
    
    try {
      await initDatabase();

      // Save practice session
      await savePracticeSession({
        documentHash,
        pageNumber,
        text: result.expected,
        accuracy: result.overallAccuracy,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });

      // Save word practice records
      for (const wordResult of result.wordResults) {
        await updateWordPractice(
          wordResult.expectedWord,
          documentHash,
          pageNumber,
          wordResult.similarity,
          false // Not marked by default
        );
      }
    } catch (error) {
      console.error('Failed to save practice data:', error);
    }
  };

  const transcribeAudio = async (_audioBlob: Blob): Promise<string> => {
    // TODO: Integrate with Whisper service when available
    // For now, use a placeholder implementation

    // In production, this would:
    // 1. Send audio to Whisper service
    // 2. Get transcription back
    // 3. Return the text

    // Placeholder: Return dummy transcription for testing
    // In real implementation, uncomment below:
    /*
    const wavBlob = await AudioRecorder.convertToWav(_audioBlob);
    const arrayBuffer = await wavBlob.arrayBuffer();
    const transcription = await invoke('transcribe_audio', {
      audioData: Array.from(new Uint8Array(arrayBuffer)),
      modelPath: 'path/to/model',
    });
    return transcription.text;
    */

    // For demo purposes, simulate transcription delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return a test transcription (you can modify this to test different scenarios)
    return text.split(' ').slice(0, -1).join(' '); // Remove last word to simulate error
  };

  const playExpectedPronunciation = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slow down for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setRecordingDuration(0);
    window.speechSynthesis.cancel();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${String(seconds)}.${String(milliseconds)}s`;
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pronunciation Practice</span>
          {result && (
            <Badge variant={result.overallAccuracy >= 70 ? 'default' : 'destructive'}>
              {result.overallAccuracy.toFixed(0)}% Accurate
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expected Text */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Read this text:</p>
          <p className="text-lg font-medium">{text}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isRecording && !isProcessing && !result && (
            <>
              <Button
                onClick={() => { void startRecording(); }}
                disabled={Boolean(error)}
                className="flex-1"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
              <Button
                onClick={playExpectedPronunciation}
                variant="outline"
                size="icon"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </>
          )}

          {isRecording && (
            <>
              <Button
                onClick={() => { void stopRecording(); }}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording ({formatDuration(recordingDuration)})
              </Button>
            </>
          )}

          {isProcessing && (
            <Button disabled className="flex-1">
              Processing...
            </Button>
          )}

          {result && (
            <>
              <Button
                onClick={() => { void startRecording(); }}
                variant="outline"
                className="flex-1"
              >
                <Mic className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={playExpectedPronunciation}
                variant="outline"
                size="icon"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button onClick={reset} variant="outline" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Accuracy</span>
                <span className={`font-bold ${getAccuracyColor(result.overallAccuracy)}`}>
                  {result.overallAccuracy.toFixed(1)}%
                </span>
              </div>
              <Progress value={result.overallAccuracy} className="h-2" />
            </div>

            {/* Transcribed Text */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">What you said:</p>
              <p className="text-sm">{result.text || '(no transcription)'}</p>
            </div>

            {/* Word-by-Word Analysis */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Word Analysis</p>
              <div className="flex flex-wrap gap-2">
                {result.wordResults.map((wordResult, index) => (
                  <Badge
                    key={index}
                    variant={wordResult.correct ? 'default' : 'destructive'}
                    className="cursor-pointer"
                    title={
                      wordResult.feedback ||
                      `${wordResult.similarity.toFixed(0)}% similar`
                    }
                  >
                    {wordResult.word || '(missing)'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <PronunciationFeedback result={result} expectedText={text} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
