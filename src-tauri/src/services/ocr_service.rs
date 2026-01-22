use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OCROptions {
    pub language: Option<String>,
    pub confidence: Option<f32>,
    pub detect_orientation: Option<bool>,
    pub preserve_layout: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OCRWord {
    pub text: String,
    pub confidence: f32,
    pub bbox: [f32; 4], // [x1, y1, x2, y2]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OCRLine {
    pub text: String,
    pub confidence: f32,
    pub words: Vec<OCRWord>,
    pub bbox: [f32; 4],
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OCRBlock {
    pub text: String,
    pub confidence: f32,
    pub lines: Vec<OCRLine>,
    pub bbox: [f32; 4],
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OCRResult {
    pub text: String,
    pub blocks: Vec<OCRBlock>,
    pub confidence: f32,
    pub language: String,
    pub page_number: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageOCRResult {
    pub page_number: usize,
    pub is_scanned: bool,
    pub result: Option<OCRResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentOCRResult {
    pub pages: Vec<PageOCRResult>,
    pub total_pages: usize,
    pub total_scanned_pages: usize,
}

/// Mock OCR service
/// In production, integrate with PaddleOCR, Tesseract.js, or cloud OCR APIs
pub struct OCRService;

impl OCRService {
    pub fn new() -> Self {
        Self
    }

    /// Check if page is scanned (contains images without text layer)
    pub fn is_page_scanned(&self, _page_data: &[u8]) -> bool {
        // Mock implementation - in production, analyze PDF structure
        // Check if page has text layer or is just images
        false // Assume not scanned for now
    }

    /// Perform OCR on page
    pub fn ocr_page(&self, _image_data: &[u8], page_number: usize, options: &OCROptions) -> OCRResult {
        // Mock OCR implementation
        // In production: Use PaddleOCR, Tesseract, or cloud APIs
        let mock_text = format!("Mock OCR text for page {}", page_number);
        
        let mock_word = OCRWord {
            text: mock_text.clone(),
            confidence: 0.92,
            bbox: [10.0, 10.0, 200.0, 30.0],
        };

        let mock_line = OCRLine {
            text: mock_text.clone(),
            confidence: 0.92,
            words: vec![mock_word],
            bbox: [10.0, 10.0, 200.0, 30.0],
        };

        let mock_block = OCRBlock {
            text: mock_text.clone(),
            confidence: 0.92,
            lines: vec![mock_line],
            bbox: [10.0, 10.0, 200.0, 30.0],
        };

        OCRResult {
            text: mock_text,
            blocks: vec![mock_block],
            confidence: 0.92,
            language: options.language.clone().unwrap_or_else(|| "en".to_string()),
            page_number,
        }
    }

    /// Process entire document for OCR
    pub fn ocr_document(&self, pages: Vec<(usize, Vec<u8>)>, options: &OCROptions) -> DocumentOCRResult {
        let mut page_results = Vec::new();
        let mut scanned_count = 0;

        for (page_number, page_data) in pages {
            let is_scanned = self.is_page_scanned(&page_data);
            
            let result = if is_scanned {
                scanned_count += 1;
                Some(self.ocr_page(&page_data, page_number, options))
            } else {
                None
            };

            page_results.push(PageOCRResult {
                page_number,
                is_scanned,
                result,
            });
        }

        DocumentOCRResult {
            total_pages: page_results.len(),
            total_scanned_pages: scanned_count,
            pages: page_results,
        }
    }

    /// Extract text from image
    pub fn extract_text(&self, image_data: &[u8], options: &OCROptions) -> String {
        let result = self.ocr_page(image_data, 0, options);
        result.text
    }
}

impl Default for OCRService {
    fn default() -> Self {
        Self::new()
    }
}
