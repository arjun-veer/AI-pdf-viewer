import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Mic,
  Play,
  Pause,
  Download,
  RefreshCw,
  Presentation,
  Volume2,
} from 'lucide-react';

interface NotebookLMPanelProps {
  documentHash: string;
  pages: Array<{ pageNumber: number; text: string }>;
}

interface AudioSummary {
  id: string;
  url: string;
  duration: number;
  hosts: ['AI Host 1', 'AI Host 2'];
  generatedAt: Date;
  cached: boolean;
}

interface Presentation {
  id: string;
  slides: Array<{
    title: string;
    content: string;
    pageReferences: number[];
  }>;
  generatedAt: Date;
  cached: boolean;
}

export function NotebookLMPanel({ documentHash, pages }: NotebookLMPanelProps) {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingPresentation, setIsGeneratingPresentation] = useState(false);
  const [audioSummary, setAudioSummary] = useState<AudioSummary | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check cache
  const checkCache = useCallback((type: 'audio' | 'presentation') => {
    const cacheKey = `notebooklm-${type}-${documentHash}`;
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }, [documentHash]);

  // Save to cache
  const saveToCache = useCallback((type: 'audio' | 'presentation', data: unknown) => {
    const cacheKey = `notebooklm-${type}-${documentHash}`;
    localStorage.setItem(cacheKey, JSON.stringify(data));
  }, [documentHash]);

  const generateAudioSummary = useCallback(async () => {
    setIsGeneratingAudio(true);
    setProgress(0);

    try {
      // Check cache first
      const cached = checkCache('audio');
      if (cached) {
        setAudioSummary(cached);
        setIsGeneratingAudio(false);
        return;
      }

      // Simulate AI audio generation with progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Mock audio summary generation
      const summary: AudioSummary = {
        id: `audio-${Date.now()}`,
        url: 'data:audio/mp3;base64,mock-audio-data', // Mock audio URL
        duration: 180, // 3 minutes
        hosts: ['AI Host 1', 'AI Host 2'],
        generatedAt: new Date(),
        cached: false,
      };

      setAudioSummary(summary);
      saveToCache('audio', summary);
    } catch (error) {
      console.error('Failed to generate audio summary:', error);
    } finally {
      setIsGeneratingAudio(false);
      setProgress(0);
    }
  }, [pages.length, checkCache, saveToCache]);

  const generatePresentation = useCallback(async () => {
    setIsGeneratingPresentation(true);
    setProgress(0);

    try {
      // Check cache first
      const cached = checkCache('presentation');
      if (cached) {
        setPresentation(cached);
        setIsGeneratingPresentation(false);
        return;
      }

      // Simulate presentation generation
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Mock presentation generation
      const mockPresentation: Presentation = {
        id: `pres-${Date.now()}`,
        slides: [
          {
            title: 'Document Overview',
            content: 'Key insights and main themes',
            pageReferences: [1, 2],
          },
          {
            title: 'Main Topics',
            content: 'Detailed analysis of core concepts',
            pageReferences: [3, 4, 5],
          },
          {
            title: 'Key Findings',
            content: 'Important conclusions and takeaways',
            pageReferences: [6, 7],
          },
          {
            title: 'Summary',
            content: 'Recap and action items',
            pageReferences: [8],
          },
        ],
        generatedAt: new Date(),
        cached: false,
      };

      setPresentation(mockPresentation);
      saveToCache('presentation', mockPresentation);
    } catch (error) {
      console.error('Failed to generate presentation:', error);
    } finally {
      setIsGeneratingPresentation(false);
      setProgress(0);
    }
  }, [pages.length, checkCache, saveToCache]);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const downloadAudio = useCallback(() => {
    if (audioSummary) {
      const a = document.createElement('a');
      a.href = audioSummary.url;
      a.download = `summary-${documentHash}.mp3`;
      a.click();
    }
  }, [audioSummary, documentHash]);

  const downloadPresentation = useCallback(() => {
    if (presentation) {
      // Export as JSON for now
      const blob = new Blob([JSON.stringify(presentation, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation-${documentHash}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [presentation, documentHash]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          NotebookLM Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Summary Section */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Audio Summary (2 AI Hosts)
          </h3>

          {!audioSummary ? (
            <div className="space-y-2">
              <Button
                onClick={generateAudioSummary}
                disabled={isGeneratingAudio}
                className="w-full"
              >
                {isGeneratingAudio ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Audio...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Generate Audio Summary
                  </>
                )}
              </Button>
              {isGeneratingAudio && <Progress value={progress} />}
            </div>
          ) : (
            <div className="space-y-2 p-3 border rounded">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">2-Host Conversation</div>
                  <div className="text-muted-foreground">
                    Duration: {Math.floor(audioSummary.duration / 60)}:
                    {(audioSummary.duration % 60).toString().padStart(2, '0')}
                  </div>
                  {audioSummary.cached && (
                    <div className="text-xs text-green-600">✓ Cached</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={togglePlayPause}>
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadAudio}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={generateAudioSummary}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <audio ref={audioRef} src={audioSummary.url} onEnded={() => setIsPlaying(false)} />
            </div>
          )}
        </div>

        {/* Presentation Section */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Presentation className="w-4 h-4" />
            Animated Presentation
          </h3>

          {!presentation ? (
            <div className="space-y-2">
              <Button
                onClick={generatePresentation}
                disabled={isGeneratingPresentation}
                className="w-full"
              >
                {isGeneratingPresentation ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Presentation...
                  </>
                ) : (
                  <>
                    <Presentation className="w-4 h-4 mr-2" />
                    Generate Presentation
                  </>
                )}
              </Button>
              {isGeneratingPresentation && <Progress value={progress} />}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {presentation.slides.length} Slides Generated
                  </div>
                  {presentation.cached && (
                    <div className="text-xs text-green-600">✓ Cached</div>
                  )}
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {presentation.slides.map((slide, index) => (
                    <div key={index} className="p-2 bg-accent rounded text-sm">
                      <div className="font-medium">
                        {index + 1}. {slide.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{slide.content}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pages: {slide.pageReferences.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={downloadPresentation}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={generatePresentation}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
          💡 Tip: Generated content is cached for faster access. Use the refresh button to
          regenerate with updated document analysis.
        </div>
      </CardContent>
    </Card>
  );
}
