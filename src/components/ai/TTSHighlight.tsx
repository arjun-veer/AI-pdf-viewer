import { useEffect, useRef } from 'react';
import { useAIStore } from '@/stores/aiStore';
import { extractWords, type TextWord } from '@/utils/textExtraction';
import { cn } from '@/lib/utils';

interface TTSHighlightProps {
  text: string;
  className?: string;
  onWordClick?: (word: TextWord) => void;
}

/**
 * TTSHighlight Component
 * 
 * Displays text with synchronized highlighting during TTS playback.
 * Highlights the current word being spoken and provides visual feedback.
 */
export function TTSHighlight({ text, className, onWordClick }: TTSHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWordIndex = useAIStore((state) => state.currentWordIndex);
  const isSpeaking = useAIStore((state) => state.isSpeaking);
  
  const words = extractWords(text);

  // Auto-scroll to keep current word visible
  useEffect(() => {
    if (!isSpeaking || !containerRef.current) return;

    const currentWordElement = containerRef.current.querySelector(
      `[data-word-index="${String(currentWordIndex)}"]`
    );

    if (currentWordElement) {
      currentWordElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [currentWordIndex, isSpeaking]);

  const handleWordClick = (word: TextWord) => {
    if (onWordClick) {
      onWordClick(word);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'rounded-lg border border-border bg-background p-4',
        'max-h-96 overflow-y-auto',
        'leading-relaxed text-foreground',
        className
      )}
    >
      {words.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No text to display
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {words.map((word) => {
            const isCurrentWord = isSpeaking && word.index === currentWordIndex;
            const isPastWord = isSpeaking && word.index < currentWordIndex;

            return (
              <span
                key={`${String(word.index)}-${String(word.startOffset)}`}
                data-word-index={String(word.index)}
                onClick={() => {
                  handleWordClick(word);
                }}
                className={cn(
                  'inline-block px-1 py-0.5 rounded transition-all duration-200',
                  'cursor-pointer hover:bg-accent/20',
                  {
                    // Current word being spoken - bright highlight with animation
                    'bg-accent text-accent-foreground font-semibold scale-105 shadow-sm':
                      isCurrentWord,
                    // Words already spoken - subtle background
                    'bg-accent/30 text-foreground': isPastWord,
                    // Words not yet spoken - default style
                    'text-foreground': !isCurrentWord && !isPastWord,
                  }
                )}
                role="button"
                tabIndex={0}
                aria-label={`Word: ${word.text}`}
                aria-current={isCurrentWord ? 'true' : undefined}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
