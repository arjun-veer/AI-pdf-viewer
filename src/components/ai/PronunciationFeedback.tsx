import { useState } from 'react';
import { Volume2, BookOpen, Languages, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { PronunciationResult } from '@/services/pronunciationService';

interface PronunciationFeedbackProps {
  result: PronunciationResult;
  expectedText: string;
}

export function PronunciationFeedback({ result }: PronunciationFeedbackProps) {
  const [playCount, setPlayCount] = useState<Map<string, number>>(new Map());

  const incorrectWords = result.wordResults.filter((r) => !r.correct);
  const hasErrors = incorrectWords.length > 0;

  const playWordPronunciation = (word: string, times: number = 3) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    let count = 0;
    const currentCount = playCount.get(word) || 0;

    const speakWord = () => {
      if (count >= times) {
        setPlayCount(new Map(playCount).set(word, currentCount + times));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7; // Slower for pronunciation practice
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        count++;
        if (count < times) {
          setTimeout(() => {
            speakWord();
          }, 500); // Pause between repetitions
        } else {
          setPlayCount(new Map(playCount).set(word, currentCount + times));
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakWord();
  };

  const getWordMeaning = (word: string): string => {
    // In production, integrate with dictionary API
    // For now, return placeholder
    const mockMeanings: Record<string, string> = {
      hello: 'A greeting or expression of welcome',
      world: 'The earth and all its inhabitants',
      pronunciation: 'The way in which a word is pronounced',
      practice: 'The actual application or use of an idea, belief, or method',
    };

    return mockMeanings[word.toLowerCase()] || 'Meaning not available';
  };

  const getWordTranslation = (word: string, targetLang: string = 'es'): string => {
    // In production, integrate with translation API
    // For now, return placeholder
    const mockTranslations: Record<string, Record<string, string>> = {
      hello: { es: 'hola', fr: 'bonjour', de: 'hallo' },
      world: { es: 'mundo', fr: 'monde', de: 'welt' },
      pronunciation: { es: 'pronunciación', fr: 'prononciation', de: 'Aussprache' },
      practice: { es: 'práctica', fr: 'pratique', de: 'Praxis' },
    };

    return mockTranslations[word.toLowerCase()]?.[targetLang] || word;
  };

  const getFeedbackIcon = () => {
    if (result.overallAccuracy === 100) return '🎉';
    if (result.overallAccuracy >= 90) return '🌟';
    if (result.overallAccuracy >= 70) return '👍';
    if (result.overallAccuracy >= 50) return '📚';
    return '💪';
  };

  return (
    <div className="space-y-4">
      {/* Feedback Summary */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{getFeedbackIcon()}</span>
          <div className="flex-1 space-y-2">
            {result.feedback.map((message, index) => (
              <p key={index} className="text-sm">
                {message}
              </p>
            ))}
          </div>
        </div>
      </Card>

      {/* Corrections Section */}
      {hasErrors && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <h3 className="font-medium">Words That Need Practice</h3>
          </div>

          <div className="space-y-4">
            {incorrectWords.map((wordResult, index) => (
              <div key={index} className="space-y-3">
                {index > 0 && <Separator />}

                {/* Word Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">
                      {wordResult.expectedWord}
                    </span>
                    <Badge variant="outline">
                      {wordResult.similarity.toFixed(0)}% match
                    </Badge>
                  </div>
                  <Button
                    onClick={() => {
                      playWordPronunciation(wordResult.expectedWord);
                    }}
                    variant="ghost"
                    size="sm"
                    title="Listen 3 times"
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    Listen ×3
                  </Button>
                </div>

                {/* What You Said */}
                {wordResult.word && wordResult.word !== wordResult.expectedWord && (
                  <div className="pl-4 border-l-2 border-yellow-600">
                    <p className="text-sm text-muted-foreground">You said:</p>
                    <p className="text-sm font-medium text-yellow-600">
                      {wordResult.word}
                    </p>
                  </div>
                )}

                {/* Correction Feedback */}
                {wordResult.feedback && (
                  <div className="pl-4 border-l-2 border-blue-600">
                    <p className="text-sm text-blue-600">{wordResult.feedback}</p>
                  </div>
                )}

                {/* Additional Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {/* Meaning */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Meaning
                      </span>
                    </div>
                    <p className="text-sm">
                      {getWordMeaning(wordResult.expectedWord)}
                    </p>
                  </div>

                  {/* Translation */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Translation (ES)
                      </span>
                    </div>
                    <p className="text-sm">
                      {getWordTranslation(wordResult.expectedWord, 'es')}
                    </p>
                  </div>
                </div>

                {/* Practice Counter */}
                {playCount.get(wordResult.expectedWord) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Practiced {playCount.get(wordResult.expectedWord)} times
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Practice All Button */}
          {incorrectWords.length > 1 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => {
                  incorrectWords.forEach((word, index) => {
                    setTimeout(() => {
                      playWordPronunciation(word.expectedWord, 2);
                    }, index * 7000); // Stagger by 7 seconds (2 reps × 3s + pause)
                  });
                }}
                variant="outline"
                className="w-full"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Practice All Words
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Perfect Score Celebration */}
      {!hasErrors && result.overallAccuracy === 100 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-green-700">
              Perfect Pronunciation!
            </p>
            <p className="text-sm text-green-600">
              You pronounced every word correctly. Keep up the great work!
            </p>
          </div>
        </Card>
      )}

      {/* Tips for Improvement */}
      {hasErrors && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-medium text-blue-700 mb-2">💡 Tips</h3>
          <ul className="space-y-1 text-sm text-blue-600">
            <li>• Listen to each word pronunciation 3 times</li>
            <li>• Speak slowly and clearly</li>
            <li>• Practice difficult words separately</li>
            <li>• Record yourself and compare</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
