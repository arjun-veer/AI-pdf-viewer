use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub size_mb: u64,
    pub download_url: String,
    pub file_name: String,
    pub description: String,
    pub language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: u64,
    pub percentage: f64,
    pub status: DownloadStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DownloadStatus {
    Pending,
    Downloading,
    Completed,
    Failed,
    Paused,
}

pub struct ModelManager {
    app_handle: AppHandle,
}

impl ModelManager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    /// Get the model storage directory path
    /// Windows: %APPDATA%\ai-pdf-viewer\models
    /// macOS: ~/Library/Application Support/ai-pdf-viewer/models
    /// Linux: ~/.local/share/ai-pdf-viewer/models
    pub fn get_models_dir(&self) -> Result<PathBuf, String> {
        let app_data_dir = self
            .app_handle
            .path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data directory: {}", e))?;

        let models_dir = app_data_dir.join("models");

        // Create directory if it doesn't exist
        if !models_dir.exists() {
            std::fs::create_dir_all(&models_dir)
                .map_err(|e| format!("Failed to create models directory: {}", e))?;
        }

        Ok(models_dir)
    }

    /// Check if a model is already downloaded
    pub fn is_model_downloaded(&self, file_name: &str) -> Result<bool, String> {
        let models_dir = self.get_models_dir()?;
        let model_path = models_dir.join(file_name);
        Ok(model_path.exists())
    }

    /// Get the full path to a model file
    pub fn get_model_path(&self, file_name: &str) -> Result<PathBuf, String> {
        let models_dir = self.get_models_dir()?;
        Ok(models_dir.join(file_name))
    }

    /// List all downloaded models
    pub fn list_downloaded_models(&self) -> Result<Vec<String>, String> {
        let models_dir = self.get_models_dir()?;
        let mut models = Vec::new();

        if models_dir.exists() {
            let entries = std::fs::read_dir(&models_dir)
                .map_err(|e| format!("Failed to read models directory: {}", e))?;

            for entry in entries.flatten() {
                if let Ok(file_name) = entry.file_name().into_string() {
                    // Only include .bin files (Whisper model format)
                    if file_name.ends_with(".bin") {
                        models.push(file_name);
                    }
                }
            }
        }

        Ok(models)
    }

    /// Get available Whisper models
    pub fn get_available_models() -> Vec<ModelInfo> {
        vec![
            ModelInfo {
                name: "Whisper Tiny".to_string(),
                size_mb: 75,
                download_url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin".to_string(),
                file_name: "ggml-tiny.bin".to_string(),
                description: "Fastest, least accurate. Good for quick tests.".to_string(),
                language: "Multilingual".to_string(),
            },
            ModelInfo {
                name: "Whisper Base".to_string(),
                size_mb: 142,
                download_url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin".to_string(),
                file_name: "ggml-base.bin".to_string(),
                description: "Balanced speed and accuracy.".to_string(),
                language: "Multilingual".to_string(),
            },
            ModelInfo {
                name: "Whisper Small".to_string(),
                size_mb: 466,
                download_url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin".to_string(),
                file_name: "ggml-small.bin".to_string(),
                description: "Good accuracy, reasonable speed. Recommended.".to_string(),
                language: "Multilingual".to_string(),
            },
            ModelInfo {
                name: "Whisper Medium".to_string(),
                size_mb: 1500,
                download_url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin".to_string(),
                file_name: "ggml-medium.bin".to_string(),
                description: "High accuracy, slower. For better quality.".to_string(),
                language: "Multilingual".to_string(),
            },
            ModelInfo {
                name: "Whisper Large".to_string(),
                size_mb: 2900,
                download_url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin".to_string(),
                file_name: "ggml-large-v3.bin".to_string(),
                description: "Best accuracy, slowest. Requires significant resources.".to_string(),
                language: "Multilingual".to_string(),
            },
        ]
    }

    /// Delete a model file
    pub fn delete_model(&self, file_name: &str) -> Result<(), String> {
        let model_path = self.get_model_path(file_name)?;

        if model_path.exists() {
            std::fs::remove_file(&model_path)
                .map_err(|e| format!("Failed to delete model: {}", e))?;
            Ok(())
        } else {
            Err("Model file not found".to_string())
        }
    }

    /// Get model file size in bytes
    pub fn get_model_size(&self, file_name: &str) -> Result<u64, String> {
        let model_path = self.get_model_path(file_name)?;

        if model_path.exists() {
            let metadata = std::fs::metadata(&model_path)
                .map_err(|e| format!("Failed to get model metadata: {}", e))?;
            Ok(metadata.len())
        } else {
            Err("Model file not found".to_string())
        }
    }
}
