use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct APIKey {
    pub service: String,
    pub key: String,
    pub created_at: String,
}

/// Keychain service for secure API key storage
/// Mock implementation - in production, use OS keychain:
/// - Windows: Windows Credential Manager
/// - macOS: Keychain Access
/// - Linux: Secret Service API (libsecret)
pub struct KeychainService {
    // In-memory storage for mock (not secure!)
    store: Mutex<HashMap<String, String>>,
}

impl KeychainService {
    pub fn new() -> Self {
        Self {
            store: Mutex::new(HashMap::new()),
        }
    }

    /// Store API key securely
    pub fn store_key(&self, service: &str, key: &str) -> Result<()> {
        let mut store = self.store.lock()
            .map_err(|e| anyhow!("Lock error: {}", e))?;
        
        // In production: Store in OS keychain
        // keyring::Entry::new(service, "api_key")?.set_password(key)?;
        
        store.insert(service.to_string(), key.to_string());
        Ok(())
    }

    /// Retrieve API key
    pub fn get_key(&self, service: &str) -> Result<String> {
        let store = self.store.lock()
            .map_err(|e| anyhow!("Lock error: {}", e))?;
        
        // In production: Retrieve from OS keychain
        // keyring::Entry::new(service, "api_key")?.get_password()
        
        store.get(service)
            .cloned()
            .ok_or_else(|| anyhow!("Key not found for service: {}", service))
    }

    /// Delete API key
    pub fn delete_key(&self, service: &str) -> Result<()> {
        let mut store = self.store.lock()
            .map_err(|e| anyhow!("Lock error: {}", e))?;
        
        // In production: Delete from OS keychain
        // keyring::Entry::new(service, "api_key")?.delete_password()?;
        
        store.remove(service)
            .ok_or_else(|| anyhow!("Key not found for service: {}", service))?;
        
        Ok(())
    }

    /// Check if key exists
    pub fn has_key(&self, service: &str) -> bool {
        if let Ok(store) = self.store.lock() {
            store.contains_key(service)
        } else {
            false
        }
    }

    /// List all stored services
    pub fn list_services(&self) -> Result<Vec<String>> {
        let store = self.store.lock()
            .map_err(|e| anyhow!("Lock error: {}", e))?;
        
        Ok(store.keys().cloned().collect())
    }
}

impl Default for KeychainService {
    fn default() -> Self {
        Self::new()
    }
}
