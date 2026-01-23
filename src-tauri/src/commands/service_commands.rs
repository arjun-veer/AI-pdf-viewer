use crate::services::*;
use std::sync::Mutex;
use tauri::State;

// Global service instances
pub struct AppState {
    pub translation: Mutex<TranslationService>,
    pub ocr: Mutex<OCRService>,
    pub keychain: Mutex<KeychainService>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            translation: Mutex::new(TranslationService::new()),
            ocr: Mutex::new(OCRService::new()),
            keychain: Mutex::new(KeychainService::new()),
        }
    }
}

// Translation Commands

#[tauri::command]
pub fn translate_text(
    text: String,
    options: TranslationOptions,
    state: State<AppState>,
) -> Result<TranslationResult, String> {
    let mut service = state.translation.lock().map_err(|e| e.to_string())?;
    Ok(service.translate_text(&text, &options))
}

#[tauri::command]
pub fn translate_page(
    page_text: String,
    page_number: usize,
    options: TranslationOptions,
    state: State<AppState>,
) -> Result<PageTranslationResult, String> {
    let mut service = state.translation.lock().map_err(|e| e.to_string())?;
    Ok(service.translate_page(&page_text, page_number, &options))
}

#[tauri::command]
pub fn translate_document(
    pages: Vec<(usize, String)>,
    options: TranslationOptions,
    state: State<AppState>,
) -> Result<DocumentTranslationResult, String> {
    let mut service = state.translation.lock().map_err(|e| e.to_string())?;
    Ok(service.translate_document(pages, &options))
}

#[tauri::command]
pub fn detect_language(
    text: String,
    state: State<AppState>,
) -> Result<String, String> {
    let service = state.translation.lock().map_err(|e| e.to_string())?;
    Ok(service.detect_language(&text))
}

// OCR Commands

#[tauri::command]
pub fn is_page_scanned(
    page_data: Vec<u8>,
    state: State<AppState>,
) -> Result<bool, String> {
    let service = state.ocr.lock().map_err(|e| e.to_string())?;
    Ok(service.is_page_scanned(&page_data))
}

#[tauri::command]
pub fn ocr_page(
    image_data: Vec<u8>,
    page_number: usize,
    options: OCROptions,
    state: State<AppState>,
) -> Result<OCRResult, String> {
    let service = state.ocr.lock().map_err(|e| e.to_string())?;
    Ok(service.ocr_page(&image_data, page_number, &options))
}

#[tauri::command]
pub fn ocr_document(
    pages: Vec<(usize, Vec<u8>)>,
    options: OCROptions,
    state: State<AppState>,
) -> Result<DocumentOCRResult, String> {
    let service = state.ocr.lock().map_err(|e| e.to_string())?;
    Ok(service.ocr_document(pages, &options))
}

#[tauri::command]
pub fn extract_text_from_image(
    image_data: Vec<u8>,
    options: OCROptions,
    state: State<AppState>,
) -> Result<String, String> {
    let service = state.ocr.lock().map_err(|e| e.to_string())?;
    Ok(service.extract_text(&image_data, &options))
}

// Keychain Commands

#[tauri::command]
pub fn store_api_key(
    service: String,
    key: String,
    state: State<AppState>,
) -> Result<(), String> {
    let keychain = state.keychain.lock().map_err(|e| e.to_string())?;
    keychain.store_key(&service, &key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_api_key(
    service: String,
    state: State<AppState>,
) -> Result<String, String> {
    let keychain = state.keychain.lock().map_err(|e| e.to_string())?;
    keychain.get_key(&service).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_api_key(
    service: String,
    state: State<AppState>,
) -> Result<(), String> {
    let keychain = state.keychain.lock().map_err(|e| e.to_string())?;
    keychain.delete_key(&service).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn has_api_key(
    service: String,
    state: State<AppState>,
) -> Result<bool, String> {
    let keychain = state.keychain.lock().map_err(|e| e.to_string())?;
    Ok(keychain.has_key(&service))
}

#[tauri::command]
pub fn list_api_services(
    state: State<AppState>,
) -> Result<Vec<String>, String> {
    let keychain = state.keychain.lock().map_err(|e| e.to_string())?;
    keychain.list_services().map_err(|e| e.to_string())
}
