class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples = 100;

  start(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.record(label, duration);
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
}

export const performanceMonitor = new PerformanceMonitor();
