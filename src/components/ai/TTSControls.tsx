import { useTTS, useVoiceSelection } from '@/hooks';
import { useAIStore } from '@/stores/aiStore';
import { cn } from '@/lib/utils';

interface TTSControlsProps {
  className?: string;
  text?: string;
}

export function TTSControls({ className, text = '' }: TTSControlsProps) {
  const { speak, pause, resume, stop, isSpeaking, isPaused, isSupported } = useTTS();
  const { voices, selectedVoice, selectVoice, isLoading } = useVoiceSelection();
  const { ttsRate, ttsPitch, ttsVolume, setTTSRate, setTTSPitch, setTTSVolume } = useAIStore();

  if (!isSupported) {
    return (
      <div className={cn('rounded border border-destructive bg-destructive/10 p-4', className)}>
        <p className="text-sm text-destructive">
          Text-to-Speech is not supported in your browser.
        </p>
      </div>
    );
  }

  const handlePlay = (): void => {
    if (isPaused) {
      resume();
    } else if (text) {
      speak(text);
    }
  };

  const handlePause = (): void => {
    pause();
  };

  const handleStop = (): void => {
    stop();
  };

  return (
    <div className={cn('flex flex-col gap-4 rounded border bg-background p-4', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">Text-to-Speech</h3>
        {isSpeaking && (
          <span className="flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          disabled={!text || (isSpeaking && !isPaused)}
          className="rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          aria-label="Play"
        >
          {isPaused ? '▶️ Resume' : '▶️ Play'}
        </button>

        <button
          onClick={handlePause}
          disabled={!isSpeaking || isPaused}
          className="rounded border bg-background px-3 py-2 text-sm font-medium hover:bg-accent/10 disabled:opacity-50"
          aria-label="Pause"
        >
          ⏸️ Pause
        </button>

        <button
          onClick={handleStop}
          disabled={!isSpeaking}
          className="rounded border bg-background px-3 py-2 text-sm font-medium hover:bg-accent/10 disabled:opacity-50"
          aria-label="Stop"
        >
          ⏹️ Stop
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="voice-select" className="text-xs font-medium text-muted-foreground">
          Voice
        </label>
        <select
          id="voice-select"
          value={selectedVoice?.name ?? ''}
          onChange={(e) => {
            const voice = voices.find((v) => v.name === e.target.value);
            if (voice) selectVoice(voice);
          }}
          disabled={isLoading || voices.length === 0}
          className="rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {voices.length === 0 && <option>Loading voices...</option>}
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="rate-slider" className="text-xs font-medium text-muted-foreground">
          Speed: {ttsRate.toFixed(1)}x
        </label>
        <input
          id="rate-slider"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={ttsRate}
          onChange={(e) => {
            setTTSRate(Number(e.target.value));
          }}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="pitch-slider" className="text-xs font-medium text-muted-foreground">
          Pitch: {ttsPitch.toFixed(1)}
        </label>
        <input
          id="pitch-slider"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={ttsPitch}
          onChange={(e) => {
            setTTSPitch(Number(e.target.value));
          }}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="volume-slider" className="text-xs font-medium text-muted-foreground">
          Volume: {Math.round(ttsVolume * 100)}%
        </label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={ttsVolume}
          onChange={(e) => {
            setTTSVolume(Number(e.target.value));
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
