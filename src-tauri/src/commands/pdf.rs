use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfMetadata {
    pub path: String,
    pub file_name: String,
    pub file_size: u64,
    pub num_pages: Option<u32>,
}

#[tauri::command]
pub async fn load_pdf(path: String) -> Result<PdfMetadata, String> {
    let file_path = PathBuf::from(&path);
    
    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }
    
    if !file_path.is_file() {
        return Err(format!("Path is not a file: {}", path));
    }
    
    let extension = file_path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("");
    
    if extension.to_lowercase() != "pdf" {
        return Err("File is not a PDF".to_string());
    }
    
    let metadata = fs::metadata(&file_path)
        .map_err(|e| format!("Failed to read file metadata: {}", e))?;
    
    let file_name = file_path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("unknown.pdf")
        .to_string();
    
    let file_size = metadata.len();
    
    Ok(PdfMetadata {
        path,
        file_name,
        file_size,
        num_pages: None,
    })
}

#[tauri::command]
pub async fn get_pdf_info(path: String) -> Result<PdfMetadata, String> {
    load_pdf(path).await
}
