/**
 * TranslationPanel Component
 * 
 * Provides UI for translating PDF text with three modes:
 * 1. Inline Translation: Select text and translate instantly
 * 2. Page Translation: Translate current page
 * 3. Document Translation: Translate entire document
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TranslationService,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
  type TranslationResult,
  type PageTranslationResult,
  type DocumentTranslationResult,
} from '@/services/translationService';
import { Languages, Copy, Check, Loader2, Globe, FileText, X } from 'lucide-react';

interface TranslationPanelProps {
  documentHash: string;
  currentPage: number;
  totalPages: number;
  pageText: string;
  selectedText?: string;
  onTranslationComplete?: () => void;
}

type TranslationMode = 'inline' | 'page' | 'document';

export function TranslationPanel({
  documentHash: _documentHash,
  currentPage,
  totalPages: _totalPages,
  pageText,
  selectedText,
  onTranslationComplete,
}: TranslationPanelProps) {
  const [mode, setMode] = useState<TranslationMode>('inline');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('es');
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('en');
  const [autoDetect, setAutoDetect] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inlineResult, setInlineResult] = useState<TranslationResult | null>(null);
  const [pageResult, setPageResult] = useState<PageTranslationResult | null>(null);
  const [documentResult, setDocumentResult] = useState<DocumentTranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize translation service
  useEffect(() => {
    const initialize = async () => {
      try {
        await TranslationService.initialize();
      } catch (err) {
        setError('Failed to initialize translation service');
        console.error('Translation initialization error:', err);
      }
    };
    void initialize();
  }, []);

  // Handle inline translation
  const translateInline = useCallback(async () => {
    if (!selectedText) {
      setError('No text selected');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await TranslationService.translateInline(selectedText, {
        ...(autoDetect ? {} : { sourceLanguage }),
        targetLanguage,
      });
      setInlineResult(result);
      onTranslationComplete?.();
    } catch (err) {
      setError('Translation failed');
      console.error('Inline translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [selectedText, targetLanguage, sourceLanguage, autoDetect, onTranslationComplete]);

  // Handle page translation
  const translatePage = useCallback(async () => {
    if (!pageText) {
      setError('No page text available');
      return;
    }

    setIsTranslating(true);
    setError(null);
    setProgress(0);

    try {
      const result = await TranslationService.translatePage(pageText, currentPage, {
        ...(autoDetect ? {} : { sourceLanguage }),
        targetLanguage,
      });
      setPageResult(result);
      setProgress(100);
      onTranslationComplete?.();
    } catch (err) {
      setError('Page translation failed');
      console.error('Page translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [pageText, currentPage, targetLanguage, sourceLanguage, autoDetect, onTranslationComplete]);

  // Handle document translation
  const translateDocument = useCallback(async () => {
    setIsTranslating(true);
    setError(null);
    setProgress(0);

    try {
      // For now, we'll simulate with current page only
      // TODO: Get all pages text from parent component
      const pages = [{ pageNumber: currentPage, text: pageText }];

      const result = await TranslationService.translateDocument(
        pages,
        {
          ...(autoDetect ? {} : { sourceLanguage }),
          targetLanguage,
        },
        (completed, total) => {
          setProgress((completed / total) * 100);
        }
      );
      setDocumentResult(result);
      onTranslationComplete?.();
    } catch (err) {
      setError('Document translation failed');
      console.error('Document translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [currentPage, pageText, targetLanguage, sourceLanguage, autoDetect, onTranslationComplete]);

  // Copy translation to clipboard
  const copyTranslation = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setInlineResult(null);
    setPageResult(null);
    setDocumentResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="h-5 w-5" />
            Translation Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'inline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { void setMode('inline'); }}
            >
              <Globe className="h-4 w-4 mr-2" />
              Inline
            </Button>
            <Button
              variant={mode === 'page' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { void setMode('page'); }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Page
            </Button>
            <Button
              variant={mode === 'document' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { void setMode('document'); }}
            >
              <Languages className="h-4 w-4 mr-2" />
              Document
            </Button>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">From:</label>
              <select
                value={autoDetect ? 'auto' : sourceLanguage}
                onChange={(e) => {
                  if (e.target.value === 'auto') {
                    setAutoDetect(true);
                  } else {
                    setAutoDetect(false);
                    setSourceLanguage(e.target.value as LanguageCode);
                  }
                }}
                className="flex-1 px-2 py-1 border rounded text-sm"
              >
                <option value="auto">Auto-detect</option>
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">To:</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                className="flex-1 px-2 py-1 border rounded text-sm"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Translate Button */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (mode === 'inline') void translateInline();
                else if (mode === 'page') void translatePage();
                else void translateDocument();
              }}
              disabled={isTranslating || (mode === 'inline' && !selectedText)}
              className="flex-1"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate {mode === 'inline' ? 'Selection' : mode === 'page' ? 'Page' : 'Document'}
                </>
              )}
            </Button>
            {(inlineResult || pageResult || documentResult) && (
              <Button onClick={clearResults} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isTranslating && progress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center mt-2 text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Inline Result */}
      {mode === 'inline' && inlineResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Translation Result</CardTitle>
              <Badge variant="outline">
                {inlineResult.sourceLanguage} → {inlineResult.targetLanguage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Original:</p>
              <p className="text-sm">{inlineResult.original}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Translated:</p>
              <p className="text-sm font-medium">{inlineResult.translated}</p>
            </div>
            <Button
              onClick={() => void copyTranslation(inlineResult.translated)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Translation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Page Result */}
      {mode === 'page' && pageResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Page {pageResult.pageNumber} Translation</CardTitle>
              <Button
                onClick={() => void copyTranslation(pageResult.translated)}
                variant="outline"
                size="sm"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2 p-2 bg-muted rounded">
              <p className="text-sm whitespace-pre-wrap">{pageResult.translated}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Result */}
      {mode === 'document' && documentResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Document Translation ({documentResult.pages.length} pages)
              </CardTitle>
              <Badge variant="outline">
                {documentResult.sourceLanguage} → {documentResult.targetLanguage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentResult.pages.map((page) => (
              <div key={page.pageNumber} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Page {page.pageNumber}</p>
                  <Button
                    onClick={() => void copyTranslation(page.translated)}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto p-2 bg-muted rounded">
                  <p className="text-sm whitespace-pre-wrap">{page.translated}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info */}
      {!inlineResult && !pageResult && !documentResult && !isTranslating && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Translation Modes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Inline:</strong> Select text in PDF to translate</li>
                <li><strong>Page:</strong> Translate current page</li>
                <li><strong>Document:</strong> Translate entire document</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
