import { useState, useEffect } from 'react';
import {
  getAvailableModels,
  isModelDownloaded,
  downloadModel,
  deleteModel,
  type ModelInfo,
  type DownloadProgress,
} from '@/services/modelService';

export function ModelDownloader() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [downloadedModels, setDownloadedModels] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Map<string, DownloadProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const availableModels = await getAvailableModels();
      setModels(availableModels);

      // Check which models are already downloaded
      const downloaded = new Set<string>();
      for (const model of availableModels) {
        const isDownloaded = await isModelDownloaded(model.file_name);
        if (isDownloaded) {
          downloaded.add(model.file_name);
        }
      }
      setDownloadedModels(downloaded);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (model: ModelInfo) => {
    try {
      setDownloading((prev) => new Set(prev).add(model.file_name));

      await downloadModel(model, (prog) => {
        setProgress((prev) => new Map(prev).set(model.file_name, prog));
      });

      setDownloadedModels((prev) => new Set(prev).add(model.file_name));
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(model.file_name);
        return next;
      });
    } catch (error) {
      console.error('Download failed:', error);
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(model.file_name);
        return next;
      });
    }
  };

  const handleDelete = async (model: ModelInfo) => {
    if (!confirm(`Delete ${model.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteModel(model.file_name);
      setDownloadedModels((prev) => {
        const next = new Set(prev);
        next.delete(model.file_name);
        return next;
      });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatSize = (mb: number): string => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)} GB`;
    }
    return `${String(mb)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading models...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">Whisper Models</h2>
        <p className="text-sm text-muted-foreground">
          Download speech recognition models for pronunciation checking
        </p>
      </div>

      <div className="space-y-3">
        {models.map((model) => {
          const isDownloaded = downloadedModels.has(model.file_name);
          const isDownloading = downloading.has(model.file_name);
          const prog = progress.get(model.file_name);

          return (
            <div
              key={model.file_name}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Size: {formatSize(model.size_mb)}</span>
                    <span>•</span>
                    <span>{model.language}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDownloaded ? (
                    <>
                      <span className="rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                        ✓ Downloaded
                      </span>
                      <button
                        onClick={() => {
                        void handleDelete(model);
                      }}
                        className="rounded border border-destructive px-3 py-1 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  ) : isDownloading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-300"
                          style={{ width: `${String(prog?.percentage ?? 0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {String(prog?.percentage.toFixed(0))}%
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        void handleDownload(model);
                      }}
                      className="rounded bg-accent px-3 py-1 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>

              {isDownloading && prog && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Downloading: {(prog.downloaded / 1024 / 1024).toFixed(1)} MB / {(prog.total / 1024 / 1024).toFixed(1)} MB
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="text-sm font-medium mb-2">Model Recommendations</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Tiny/Base:</strong> For quick testing and low-end devices</li>
          <li>• <strong>Small:</strong> Recommended for most users (best balance)</li>
          <li>• <strong>Medium/Large:</strong> For high accuracy requirements</li>
        </ul>
      </div>
    </div>
  );
}
