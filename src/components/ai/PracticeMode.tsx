import { useState, useEffect, useCallback } from 'react';
import { BookMarked, TrendingUp, Target, Clock, Award, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  getProgressStats,
  getMarkedWords,
  getDifficultyStats,
  type WordPractice,
  type DifficultyStats,
} from '@/services/practiceDatabase';
import { WordMarker } from './WordMarker';

interface PracticeModeProps {
  documentHash: string;
  pageText: string;
  pageNumber: number;
  onPracticeWord?: (word: string) => void;
}

export function PracticeMode({
  documentHash,
  pageText,
  pageNumber,
  onPracticeWord,
}: PracticeModeProps) {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalWords: 0,
    markedWords: 0,
    averageAccuracy: 0,
    difficultWords: 0,
  });
  const [markedWords, setMarkedWords] = useState<WordPractice[]>([]);
  const [difficultyStats, setDifficultyStats] = useState<DifficultyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'marked' | 'difficult'>('overview');

  const loadPracticeData = useCallback(async () => {
    setLoading(true);
    try {
      const [progressStats, marked, difficulty] = await Promise.all([
        getProgressStats(documentHash),
        getMarkedWords(documentHash),
        getDifficultyStats(documentHash),
      ]);

      setStats(progressStats);
      setMarkedWords(marked);
      setDifficultyStats(difficulty.filter((d) => d.needsPractice));
    } catch (error) {
      console.error('Failed to load practice data:', error);
    } finally {
      setLoading(false);
    }
  }, [documentHash]);

  useEffect(() => {
    void loadPracticeData();
  }, [loadPracticeData]);

  const handleWordMarked = () => {
    void loadPracticeData();
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadgeVariant = (accuracy: number): 'default' | 'secondary' | 'destructive' => {
    if (accuracy >= 90) return 'default';
    if (accuracy >= 70) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading practice data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'overview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveView('overview');
          }}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeView === 'marked' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveView('marked');
          }}
        >
          <BookMarked className="w-4 h-4 mr-2" />
          Marked ({stats.markedWords})
        </Button>
        <Button
          variant={activeView === 'difficult' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveView('difficult');
          }}
        >
          <Target className="w-4 h-4 mr-2" />
          Difficult ({stats.difficultWords})
        </Button>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Sessions</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Accuracy</span>
                </div>
                <p className={`text-2xl font-bold ${getAccuracyColor(stats.averageAccuracy)}`}>
                  {stats.averageAccuracy.toFixed(0)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Marked</span>
                </div>
                <p className="text-2xl font-bold">{stats.markedWords}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Difficult</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.difficultWords}</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          {stats.totalWords > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Words Practiced</span>
                    <span className="font-medium">{stats.totalWords}</span>
                  </div>
                  <Progress
                    value={(stats.totalWords / Math.max(pageText.split(/\s+/).length, 1)) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Word Marker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mark Words for Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <WordMarker
                text={pageText}
                documentHash={documentHash}
                pageNumber={pageNumber}
                onWordMarked={handleWordMarked}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marked Words Tab */}
      {activeView === 'marked' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Marked Words</span>
              <Button variant="ghost" size="sm" onClick={() => { void loadPracticeData(); }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {markedWords.length === 0 ? (
              <div className="text-center py-8">
                <BookMarked className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No marked words yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mark difficult words to practice later
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {markedWords.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{word.word}</span>
                        <Badge variant={getAccuracyBadgeVariant(word.averageAccuracy)}>
                          {word.averageAccuracy.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{word.attempts} attempts</span>
                        <span>•</span>
                        <span>
                          {word.successCount}/{word.attempts} success
                        </span>
                        <span>•</span>
                        <span>Page {word.pageNumber}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onPracticeWord?.(word.word)}
                      disabled={!onPracticeWord}
                    >
                      Practice
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Difficult Words Tab */}
      {activeView === 'difficult' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Words Needing Practice</span>
              <Button variant="ghost" size="sm" onClick={() => { void loadPracticeData(); }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {difficultyStats.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto mb-3 text-green-600 opacity-50" />
                <p className="text-sm text-muted-foreground">All words mastered!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep practicing to maintain your skills
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {difficultyStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{stat.word}</span>
                          <Badge variant="destructive">
                            {stat.averageAccuracy.toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{stat.attempts} attempts</span>
                          <span>•</span>
                          <span>{stat.successRate.toFixed(0)}% success rate</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPracticeWord?.(stat.word)}
                        disabled={!onPracticeWord}
                      >
                        Practice
                      </Button>
                    </div>
                    {index < difficultyStats.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
