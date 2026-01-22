class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples = 100;
  private renderTimingThreshold = 50;
  private memoryWarningThreshold = 150 * 1024 * 1024;

  start(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.record(label, duration);
      
      if (label.includes('render') && duration > this.renderTimingThreshold) {
        console.warn(`[Performance] Slow render detected: ${label} took ${duration.toFixed(2)}ms (target: <${this.renderTimingThreshold.toString()}ms)`);
      }
    };
  }

  record(label: string, duration: number): void {
    const samples = this.metrics.get(label) ?? [];
    samples.push(duration);
    
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
    
    this.metrics.set(label, samples);
  }

  getStats(label: string): {
    avg: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const samples = this.metrics.get(label);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sum = samples.reduce((a, b) => a + b, 0);
    return {
      avg: sum / samples.length,
      min: Math.min(...samples),
      max: Math.max(...samples),
      count: samples.length,
    };
  }

  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const result: Record<string, ReturnType<typeof this.getStats>> = {};
    
    for (const [label] of this.metrics) {
      result[label] = this.getStats(label);
    }
    
    return result;
  }

  clear(label?: string): void {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }

  logStats(label?: string): void {
    if (label) {
      const stats = this.getStats(label);
      if (stats) {
        console.log(`[Performance] ${label}:`, stats);
      }
    } else {
      console.log('[Performance] All metrics:', this.getAllStats());
    }
  }

  getMemoryUsage(): { used: number; limit: number } | null {
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };
      }
    }
    return null;
  }

  checkMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    if (memory && memory.used > this.memoryWarningThreshold) {
      const usedMB = (memory.used / 1024 / 1024).toFixed(2);
      const thresholdMB = (this.memoryWarningThreshold / 1024 / 1024).toFixed(2);
      console.warn(`[Performance] High memory usage: ${usedMB}MB (threshold: ${thresholdMB}MB)`);
    }
  }

  setRenderTimingThreshold(ms: number): void {
    this.renderTimingThreshold = ms;
  }

  setMemoryWarningThreshold(bytes: number): void {
    this.memoryWarningThreshold = bytes;
  }
}

export const performanceMonitor = new PerformanceMonitor();
