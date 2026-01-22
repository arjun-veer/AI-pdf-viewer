/**
 * OCRPanel Component
 * 
 * Provides UI for OCR functionality:
 * 1. Auto-detect scanned pages
 * 2. Extract text from scanned PDFs
 * 3. Export OCR results
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  OCRService,
  SUPPORTED_OCR_LANGUAGES,
  type OCRLanguageCode,
  type OCRResult,
  type DocumentOCRResult,
} from '@/services/ocrService';
import { ScanSearch, Download, Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';

interface OCRPanelProps {
  documentHash: string;
  currentPage: number;
  totalPages: number;
  pageText: string;
  canvas?: HTMLCanvasElement;
  hasImages: boolean;
  onOCRComplete?: (result: OCRResult) => void;
}

export function OCRPanel({
  documentHash: _documentHash,
  currentPage,
  totalPages,
  pageText,
  canvas,
  hasImages,
  onOCRComplete,
}: OCRPanelProps) {
  const [language, setLanguage] = useState<OCRLanguageCode>('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScanned, setIsScanned] = useState<boolean | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [documentResult, setDocumentResult] = useState<DocumentOCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'page' | 'document'>('page');

  // Initialize OCR service
  useEffect(() => {
    const initialize = () => {
      try {
        OCRService.initialize();
      } catch (err) {
        setError('Failed to initialize OCR service');
        console.error('OCR initialization error:', err);
      }
    };
    initialize();
  }, []);

  // Detect if current page is scanned
  useEffect(() => {
    const detectScanned = () => {
      const result = OCRService.detectScannedPage(currentPage, pageText, hasImages);
      setIsScanned(result);
    };
    detectScanned();
  }, [currentPage, pageText, hasImages]);

  // Process current page
  const processPage = useCallback(async () => {
    if (!canvas) {
      setError('Canvas not available');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const result = await OCRService.processScannedPage(canvas, currentPage, {
        language,
        detectOrientation: true,
        preserveLayout: true,
      });

      setOcrResult(result);
      setProgress(100);
      onOCRComplete?.(result);
    } catch (err) {
      setError('OCR processing failed');
      console.error('OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [canvas, currentPage, language, onOCRComplete]);

  // Process entire document
  const processDocument = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // For now, process only current page
      // TODO: Get all pages from parent component
      const pages: Array<{
        pageNumber: number;
        canvas?: HTMLCanvasElement;
        textContent: string;
        hasImages: boolean;
      }> = [
        {
          pageNumber: currentPage,
          ...(canvas ? { canvas } : {}),
          textContent: pageText,
          hasImages,
        },
      ];

      const result = await OCRService.processDocument(
        pages,
        {
          language,
          detectOrientation: true,
          preserveLayout: true,
        },
        (completed, total) => {
          setProgress((completed / total) * 100);
        }
      );

      setDocumentResult(result);
      if (result.pages[0]?.result) {
        onOCRComplete?.(result.pages[0].result);
      }
    } catch (err) {
      setError('Document OCR failed');
      console.error('Document OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [canvas, currentPage, pageText, hasImages, language, onOCRComplete]);

  // Export OCR result
  const exportResult = useCallback(
    (format: 'text' | 'json' | 'markdown') => {
      if (!ocrResult) return;

      const exported = OCRService.exportResult(ocrResult, format);
      const blob = new Blob([exported], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ocr-page-${String(currentPage)}.${format === 'json' ? 'json' : 'txt'}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [ocrResult, currentPage]
  );

  // Copy result to clipboard
  const copyResult = useCallback(() => {
    if (!ocrResult) return;

    try {
      void navigator.clipboard.writeText(ocrResult.text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [ocrResult]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Scanned Page Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScanSearch className="h-5 w-5" />
            OCR Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Page:</span>
            {isScanned === null ? (
              <Badge variant="outline">Checking...</Badge>
            ) : isScanned ? (
              <Badge className="bg-orange-500">
                <FileText className="h-3 w-3 mr-1" />
                Scanned Page
              </Badge>
            ) : (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Text-Based
              </Badge>
            )}
          </div>

          {isScanned && (
            <p className="text-sm text-muted-foreground">
              This page appears to be scanned. Use OCR to extract text.
            </p>
          )}
        </CardContent>
      </Card>

      {/* OCR Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">OCR Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'page' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setMode('page'); }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Current Page
            </Button>
            <Button
              variant={mode === 'document' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setMode('document'); }}
            >
              <ScanSearch className="h-4 w-4 mr-2" />
              Full Document
            </Button>
          </div>

          {/* Language Selection */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Language:</label>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value as OCRLanguageCode); }}
              className="flex-1 px-2 py-1 border rounded text-sm"
            >
              {Object.entries(SUPPORTED_OCR_LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Process Button */}
          <Button
            onClick={() => { if (mode === 'page') { void processPage(); } else { void processDocument(); } }}
            disabled={isProcessing || !canvas}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ScanSearch className="h-4 w-4 mr-2" />
                Process {mode === 'page' ? 'Page' : 'Document'}
              </>
            )}
          </Button>

          {mode === 'document' && (
            <p className="text-xs text-muted-foreground">
              Estimated time: ~{Math.ceil((totalPages * 2) / 60)} minutes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      {isProcessing && progress > 0 && (
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
          <CardContent className="pt-6 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* OCR Result */}
      {ocrResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">OCR Result</CardTitle>
              <Badge variant="outline">
                Confidence: {(ocrResult.confidence * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto p-3 bg-muted rounded">
              <p className="text-sm whitespace-pre-wrap">{ocrResult.text}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyResult} variant="outline" size="sm" className="flex-1">
                Copy Text
              </Button>
              <Button onClick={() => void exportResult('text')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                .txt
              </Button>
              <Button onClick={() => void exportResult('json')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                .json
              </Button>
              <Button onClick={() => void exportResult('markdown')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                .md
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                Extracted {ocrResult.blocks.length} blocks with average confidence of{' '}
                {(ocrResult.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Result */}
      {documentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document OCR Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Total Pages:</span>
              <Badge variant="outline">{documentResult.totalPages}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Scanned Pages:</span>
              <Badge className="bg-orange-500">{documentResult.scannedPages}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Text-Based Pages:</span>
              <Badge className="bg-green-500">
                {documentResult.totalPages - documentResult.scannedPages}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      {!ocrResult && !documentResult && !isProcessing && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">OCR Features:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Automatic scanned page detection</li>
                <li>Text extraction from images</li>
                <li>Support for 14+ languages</li>
                <li>Export to text, JSON, or markdown</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
