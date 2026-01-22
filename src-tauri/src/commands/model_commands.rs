use crate::services::{ModelInfo, ModelManager};
use tauri::{AppHandle, command};

#[command]
pub fn get_available_models() -> Vec<ModelInfo> {
    ModelManager::get_available_models()
}

#[command]
pub fn get_models_dir(app: AppHandle) -> Result<String, String> {
    let manager = ModelManager::new(app);
    let path = manager.get_models_dir()?;
    Ok(path.to_string_lossy().to_string())
}

#[command]
pub fn is_model_downloaded(app: AppHandle, file_name: String) -> Result<bool, String> {
    let manager = ModelManager::new(app);
    manager.is_model_downloaded(&file_name)
}

#[command]
pub fn list_downloaded_models(app: AppHandle) -> Result<Vec<String>, String> {
    let manager = ModelManager::new(app);
    manager.list_downloaded_models()
}

#[command]
pub fn get_model_path(app: AppHandle, file_name: String) -> Result<String, String> {
    let manager = ModelManager::new(app);
    let path = manager.get_model_path(&file_name)?;
    Ok(path.to_string_lossy().to_string())
}

#[command]
pub fn delete_model(app: AppHandle, file_name: String) -> Result<(), String> {
    let manager = ModelManager::new(app);
    manager.delete_model(&file_name)
}

#[command]
pub fn get_model_size(app: AppHandle, file_name: String) -> Result<u64, String> {
    let manager = ModelManager::new(app);
    manager.get_model_size(&file_name)
}
