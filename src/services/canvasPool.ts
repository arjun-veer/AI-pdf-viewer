interface CanvasPoolMetrics {
  totalAcquired: number;
  totalReleased: number;
  currentPoolSize: number;
  cacheHits: number;
  cacheMisses: number;
}

class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private maxSize: number;
  private metrics: CanvasPoolMetrics = {
    totalAcquired: 0,
    totalReleased: 0,
    currentPoolSize: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  constructor(maxSize: number = 20) {
    this.maxSize = maxSize;
  }

  acquire(width?: number, height?: number): HTMLCanvasElement {
    this.metrics.totalAcquired++;
    
    const canvas = this.pool.pop();
    if (canvas) {
      this.metrics.cacheHits++;
      this.metrics.currentPoolSize = this.pool.length;
      
      if (width && height) {
        canvas.width = width;
        canvas.height = height;
      }
      
      return canvas;
    }

    this.metrics.cacheMisses++;
    this.metrics.currentPoolSize = this.pool.length;
    
    const newCanvas = document.createElement('canvas');
    if (width && height) {
      newCanvas.width = width;
      newCanvas.height = height;
    }
    
    return newCanvas;
  }

  release(canvas: HTMLCanvasElement): void {
    if (this.pool.length >= this.maxSize) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    canvas.width = 0;
    canvas.height = 0;
    
    this.pool.push(canvas);
    this.metrics.totalReleased++;
    this.metrics.currentPoolSize = this.pool.length;
  }

  clear(): void {
    this.pool = [];
    this.metrics.currentPoolSize = 0;
  }

  getMetrics(): Readonly<CanvasPoolMetrics> {
    return { ...this.metrics };
  }

  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
    while (this.pool.length > maxSize) {
      this.pool.pop();
    }
    this.metrics.currentPoolSize = this.pool.length;
  }

  getPoolSize(): number {
    return this.pool.length;
  }

  getMaxSize(): number {
    return this.maxSize;
  }
}

export const canvasPool = new CanvasPool();
