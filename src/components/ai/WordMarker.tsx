import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getWordPractice,
  toggleWordMarked,
  type WordPractice,
} from '@/services/practiceDatabase';

interface WordMarkerProps {
  text: string;
  documentHash: string;
  pageNumber: number;
  onWordMarked?: () => void;
}

export function WordMarker({ text, documentHash, pageNumber, onWordMarked }: WordMarkerProps) {
  const [markedWords, setMarkedWords] = useState<Set<string>>(new Set());
  const [practiceData, setPracticeData] = useState<Map<string, WordPractice>>(new Map());
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const words = useMemo(() => {
    // Extract words from text
    const extractedWords = text
      .toLowerCase()
      .replace(/[.,!?;:"""''()[\]{}]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Remove duplicates while preserving order
    return Array.from(new Set(extractedWords));
  }, [text]);

  const loadPracticeData = useCallback(async () => {
    try {
      const practices = await getWordPractice(documentHash, pageNumber);
      const dataMap = new Map<string, WordPractice>();
      const marked = new Set<string>();

      practices.forEach((practice) => {
        dataMap.set(practice.word.toLowerCase(), practice);
        if (practice.marked) {
          marked.add(practice.word.toLowerCase());
        }
      });

      setPracticeData(dataMap);
      setMarkedWords(marked);
    } catch (error) {
      console.error('Failed to load practice data:', error);
    }
  }, [documentHash, pageNumber]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPracticeData();
  }, [loadPracticeData]);

  const handleWordClick = (word: string) => {
    setSelectedWord(word === selectedWord ? null : word);
  };

  const handleToggleMark = async (word: string) => {
    try {
      await toggleWordMarked(word, documentHash, pageNumber);

      // Update local state
      setMarkedWords((prev) => {
        const next = new Set(prev);
        if (next.has(word)) {
          next.delete(word);
        } else {
          next.add(word);
        }
        return next;
      });

      onWordMarked?.();
    } catch (error) {
      console.error('Failed to toggle word mark:', error);
    }
  };

  const getWordStats = (word: string): WordPractice | undefined => {
    return practiceData.get(word.toLowerCase());
  };

  const getWordColor = (word: string): string => {
    const stats = getWordStats(word);
    if (!stats) return '';

    if (markedWords.has(word.toLowerCase())) {
      return 'bg-yellow-100 dark:bg-yellow-900/30';
    }

    if (stats.averageAccuracy >= 90) {
      return 'bg-green-100 dark:bg-green-900/30';
    }

    if (stats.averageAccuracy >= 70) {
      return 'bg-blue-100 dark:bg-blue-900/30';
    }

    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getWordBorderColor = (word: string): string => {
    if (selectedWord === word) {
      return 'border-2 border-primary';
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded" />
          <span className="text-muted-foreground">Mastered (90%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded" />
          <span className="text-muted-foreground">Good (70-89%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded" />
          <span className="text-muted-foreground">Needs Practice (&lt;70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded" />
          <span className="text-muted-foreground">Marked</span>
        </div>
      </div>

      {/* Words Grid */}
      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg max-h-96 overflow-y-auto">
        {words.map((word, index) => {
          const stats = getWordStats(word);

          return (
            <button
              key={`${word}-${String(index)}`}
              onClick={() => { handleWordClick(word); }}
              className={`
                px-3 py-1.5 rounded-md cursor-pointer transition-all
                ${getWordColor(word)}
                ${getWordBorderColor(word)}
                hover:shadow-md
              `}
            >
              <span className="text-sm font-medium">{word}</span>
              {stats && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {stats.averageAccuracy.toFixed(0)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Word Details */}
      {selectedWord && (
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">{selectedWord}</h3>
            <Button
              size="sm"
              variant={markedWords.has(selectedWord.toLowerCase()) ? 'default' : 'outline'}
              onClick={() => { void handleToggleMark(selectedWord); }}
            >
              {markedWords.has(selectedWord.toLowerCase()) ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Marked
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Mark for Practice
                </>
              )}
            </Button>
          </div>

          {(() => {
            const stats = getWordStats(selectedWord);
            if (!stats) {
              return (
                <p className="text-sm text-muted-foreground">
                  No practice history yet. Start practicing to track your progress!
                </p>
              );
            }

            return (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Attempts</p>
                    <p className="text-lg font-bold">{stats.attempts}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-lg font-bold">
                      {((stats.successCount / stats.attempts) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Last Accuracy</p>
                    <p className="text-lg font-bold">{stats.lastAccuracy.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Average</p>
                    <p className="text-lg font-bold">{stats.averageAccuracy.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      stats.averageAccuracy >= 90
                        ? 'default'
                        : stats.averageAccuracy >= 70
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {stats.averageAccuracy >= 90
                      ? 'Mastered'
                      : stats.averageAccuracy >= 70
                        ? 'Good Progress'
                        : 'Needs Practice'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Last practiced: {new Date(stats.lastPracticed).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total words: {words.length}</span>
        <span>Marked: {markedWords.size}</span>
        <span>Practiced: {practiceData.size}</span>
      </div>
    </div>
  );
}
