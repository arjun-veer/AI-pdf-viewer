use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationOptions {
    pub source_language: Option<String>,
    pub target_language: String,
    pub preserve_formatting: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationResult {
    pub original: String,
    pub translated: String,
    pub source_language: String,
    pub target_language: String,
    pub confidence: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationChunk {
    pub index: usize,
    pub original: String,
    pub translated: String,
    pub start_offset: usize,
    pub end_offset: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageTranslationResult {
    pub page_number: usize,
    pub original: String,
    pub translated: String,
    pub chunks: Vec<TranslationChunk>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentTranslationResult {
    pub pages: Vec<PageTranslationResult>,
    pub total_pages: usize,
    pub source_language: String,
    pub target_language: String,
    pub completed_at: String,
}

/// Mock translation service
/// In production, integrate with NLLB-200 model or cloud translation APIs
pub struct TranslationService {
    cache: HashMap<String, String>,
}

impl TranslationService {
    pub fn new() -> Self {
        Self {
            cache: HashMap::new(),
        }
    }

    /// Translate text with mock implementation
    pub fn translate_text(&mut self, text: &str, options: &TranslationOptions) -> TranslationResult {
        let cache_key = format!("{}-{}-{}", 
            text, 
            options.source_language.as_deref().unwrap_or("auto"), 
            options.target_language
        );

        let translated = if let Some(cached) = self.cache.get(&cache_key) {
            cached.clone()
        } else {
            // Mock translation - in production, call NLLB-200 or translation API
            let result = self.mock_translate(text, &options.target_language);
            self.cache.insert(cache_key, result.clone());
            result
        };

        TranslationResult {
            original: text.to_string(),
            translated,
            source_language: options.source_language.clone().unwrap_or_else(|| "en".to_string()),
            target_language: options.target_language.clone(),
            confidence: Some(0.95),
        }
    }

    /// Translate page text in chunks
    pub fn translate_page(&mut self, page_text: &str, page_number: usize, options: &TranslationOptions) -> PageTranslationResult {
        let chunks = self.chunk_text(page_text, 500);
        let mut translated_chunks = Vec::new();
        let mut offset = 0;

        for (index, chunk) in chunks.iter().enumerate() {
            let result = self.translate_text(chunk, options);
            translated_chunks.push(TranslationChunk {
                index,
                original: chunk.clone(),
                translated: result.translated.clone(),
                start_offset: offset,
                end_offset: offset + chunk.len(),
            });
            offset += chunk.len();
        }

        let full_translated = translated_chunks.iter()
            .map(|c| c.translated.as_str())
            .collect::<Vec<_>>()
            .join(" ");

        PageTranslationResult {
            page_number,
            original: page_text.to_string(),
            translated: full_translated,
            chunks: translated_chunks,
        }
    }

    /// Translate entire document
    pub fn translate_document(
        &mut self, 
        pages: Vec<(usize, String)>, 
        options: &TranslationOptions
    ) -> DocumentTranslationResult {
        let mut page_results = Vec::new();

        for (page_number, page_text) in pages {
            let result = self.translate_page(&page_text, page_number, options);
            page_results.push(result);
        }

        DocumentTranslationResult {
            total_pages: page_results.len(),
            pages: page_results,
            source_language: options.source_language.clone().unwrap_or_else(|| "en".to_string()),
            target_language: options.target_language.clone(),
            completed_at: chrono::Utc::now().to_rfc3339(),
        }
    }

    /// Detect language of text
    pub fn detect_language(&self, text: &str) -> String {
        // Mock language detection - in production, use proper language detection
        if text.chars().any(|c| c as u32 > 0x4E00 && c as u32 < 0x9FFF) {
            "zh".to_string()
        } else if text.chars().any(|c| "àâäèéêëîïôùûüÿæœç".contains(c)) {
            "fr".to_string()
        } else if text.chars().any(|c| "äöüß".contains(c)) {
            "de".to_string()
        } else if text.chars().any(|c| "áéíóúñü¿¡".contains(c)) {
            "es".to_string()
        } else {
            "en".to_string()
        }
    }

    // Helper functions

    fn chunk_text(&self, text: &str, chunk_size: usize) -> Vec<String> {
        let words: Vec<&str> = text.split_whitespace().collect();
        let mut chunks = Vec::new();
        let mut current_chunk = String::new();

        for word in words {
            if current_chunk.len() + word.len() + 1 > chunk_size && !current_chunk.is_empty() {
                chunks.push(current_chunk.trim().to_string());
                current_chunk = String::new();
            }
            if !current_chunk.is_empty() {
                current_chunk.push(' ');
            }
            current_chunk.push_str(word);
        }

        if !current_chunk.is_empty() {
            chunks.push(current_chunk.trim().to_string());
        }

        if chunks.is_empty() {
            chunks.push(text.to_string());
        }

        chunks
    }

    fn mock_translate(&self, text: &str, target_lang: &str) -> String {
        // Mock translation for demonstration
        // In production: Use NLLB-200, Transformers.js, or cloud APIs
        match target_lang {
            "es" => format!("[ES: {}]", text),
            "fr" => format!("[FR: {}]", text),
            "de" => format!("[DE: {}]", text),
            "zh" => format!("[中文: {}]", text),
            "ja" => format!("[日本語: {}]", text),
            "ar" => format!("[عربي: {}]", text),
            "hi" => format!("[हिन्दी: {}]", text),
            _ => text.to_string(),
        }
    }
}

impl Default for TranslationService {
    fn default() -> Self {
        Self::new()
    }
}
