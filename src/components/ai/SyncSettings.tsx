/**
 * SyncSettings Component
 * 
 * UI for cloud sync configuration and management
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudSyncService, type SyncStatus } from '@/services/cloudSyncService';
import { Cloud, CloudOff, RefreshCw, Download, Upload, Check, X, Loader2 } from 'lucide-react';

export function SyncSettings() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(60);
  const [status, setStatus] = useState<SyncStatus>({
    lastSync: null,
    pending: 0,
    syncing: false,
    error: null,
  });
  const [stats, setStats] = useState<{
    totalItems: number;
    pendingSync: number;
    lastSync: Date | null;
  }>({ totalItems: 0, pendingSync: 0, lastSync: null });
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings and status
  useEffect(() => {
    const loadSettings = () => {
      if (CloudSyncService.isInitialized()) {
        const currentStatus = CloudSyncService.getStatus();
        const currentStats = CloudSyncService.getStats();
        setStatus(currentStatus);
        setStats(currentStats);
      }
    };
    loadSettings();

    // Update status every second
    const interval = setInterval(() => {
      if (CloudSyncService.isInitialized()) {
        setStatus(CloudSyncService.getStatus());
        setStats(CloudSyncService.getStats());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize sync service
  const handleInitialize = useCallback(() => {
    try {
      CloudSyncService.initialize({
        apiUrl,
        apiKey,
        autoSync,
        syncInterval: syncInterval * 1000,
      });
      setStatus(CloudSyncService.getStatus());
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }, [apiUrl, apiKey, autoSync, syncInterval]);

  // Configure sync
  const handleConfigure = useCallback(() => {
    CloudSyncService.configure({
      apiUrl,
      apiKey,
      autoSync,
      syncInterval: syncInterval * 1000,
    });
  }, [apiUrl, apiKey, autoSync, syncInterval]);

  // Manual sync
  const handleSync = useCallback(async () => {
    try {
      await CloudSyncService.sync();
      setStatus(CloudSyncService.getStatus());
    } catch (err) {
      console.error('Sync error:', err);
    }
  }, []);

  // Export data
  const handleExport = useCallback(() => {
    const data = CloudSyncService.exportLocal();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Import data
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      CloudSyncService.importLocal(content);
      setStats(CloudSyncService.getStats());
    };
    reader.readAsText(file);
  }, []);

  // Clear local data
  const handleClear = useCallback(() => {
    if (confirm('Clear all local data? This cannot be undone.')) {
      CloudSyncService.clearLocal();
      setStats(CloudSyncService.getStats());
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {CloudSyncService.isInitialized() ? (
                <Cloud className="h-5 w-5 text-green-500" />
              ) : (
                <CloudOff className="h-5 w-5 text-muted-foreground" />
              )}
              Cloud Sync
            </CardTitle>
            {status.syncing && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Status:</span>
            <Badge
              variant={status.error ? 'destructive' : CloudSyncService.isInitialized() ? 'default' : 'outline'}
            >
              {status.error
                ? 'Error'
                : CloudSyncService.isInitialized()
                ? 'Connected'
                : 'Not Configured'}
            </Badge>
          </div>

          {status.lastSync && (
            <div className="flex items-center justify-between text-sm">
              <span>Last Sync:</span>
              <span className="text-muted-foreground">
                {status.lastSync.toLocaleTimeString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span>Pending:</span>
            <Badge variant={status.pending > 0 ? 'default' : 'outline'}>{status.pending}</Badge>
          </div>

          {status.error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              <X className="h-4 w-4" />
              {status.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API URL:</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => { setApiUrl(e.target.value); }}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">API Key:</label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); }}
                placeholder="Your API key"
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <Button
                onClick={() => { setShowApiKey(!showApiKey); }}
                variant="outline"
                size="sm"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSync"
              checked={autoSync}
              onChange={(e) => { setAutoSync(e.target.checked); }}
              className="rounded"
            />
            <label htmlFor="autoSync" className="text-sm font-medium">
              Enable auto-sync
            </label>
          </div>

          {autoSync && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Interval (seconds):</label>
              <input
                type="number"
                value={syncInterval}
                onChange={(e) => { void setSyncInterval(Number(e.target.value)); }}
                min={10}
                max={3600}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          )}

          <div className="flex gap-2">
            {!CloudSyncService.isInitialized() ? (
              <Button onClick={() => { void handleInitialize(); }} className="flex-1">
                <Cloud className="h-4 w-4 mr-2" />
                Initialize
              </Button>
            ) : (
              <Button onClick={() => { void handleConfigure(); }} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Update Config
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={handleSync}
            disabled={!CloudSyncService.isInitialized() || status.syncing}
            className="w-full"
          >
            {status.syncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
            </label>
          </div>

          <Button onClick={handleClear} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Clear Local Data
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Total Items:</span>
            <Badge variant="outline">{stats.totalItems}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Pending Sync:</span>
            <Badge variant={stats.pendingSync > 0 ? 'default' : 'outline'}>
              {stats.pendingSync}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Cloud Sync Features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sync annotations across devices</li>
              <li>Save reading progress</li>
              <li>Backup practice history</li>
              <li>Offline-first with auto-sync</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
