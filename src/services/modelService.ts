import { invoke } from '@tauri-apps/api/core';

export interface ModelInfo {
  name: string;
  size_mb: number;
  download_url: string;
  file_name: string;
  description: string;
  language: string;
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
}

export async function getAvailableModels(): Promise<ModelInfo[]> {
  return await invoke('get_available_models');
}

export async function getModelsDir(): Promise<string> {
  return await invoke('get_models_dir');
}

export async function isModelDownloaded(fileName: string): Promise<boolean> {
  return await invoke('is_model_downloaded', { fileName });
}

export async function listDownloadedModels(): Promise<string[]> {
  return await invoke('list_downloaded_models');
}

export async function getModelPath(fileName: string): Promise<string> {
  return await invoke('get_model_path', { fileName });
}

export async function deleteModel(fileName: string): Promise<void> {
  await invoke('delete_model', { fileName });
}

export async function getModelSize(fileName: string): Promise<number> {
  return await invoke('get_model_size', { fileName });
}

/**
 * Download a model with progress tracking
 * This is a placeholder - actual implementation will use Rust HTTP client
 */
export async function downloadModel(
  modelInfo: ModelInfo,
  onProgress: (progress: DownloadProgress) => void
): Promise<void> {
  // For now, use browser fetch API
  // In production, this should be implemented in Rust for better control
  const response = await fetch(modelInfo.download_url);
  
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  
  if (!reader) {
    throw new Error('Failed to get response reader');
  }
  
  const contentLength = Number(response.headers.get('content-length') ?? '0');

  let downloaded = 0;
  const chunks: Uint8Array[] = [];

  onProgress({
    downloaded: 0,
    total: contentLength,
    percentage: 0,
    status: 'downloading',
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    downloaded += value.length;

    onProgress({
      downloaded,
      total: contentLength,
      percentage: (downloaded / contentLength) * 100,
      status: 'downloading',
    });
  }

  // Combine chunks
  const blob = new Blob(chunks);
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Save to file system via Rust
  // TODO: Implement save_model command in Rust
  console.log('Model downloaded, size:', uint8Array.length);

  onProgress({
    downloaded: contentLength,
    total: contentLength,
    percentage: 100,
    status: 'completed',
  });
}
