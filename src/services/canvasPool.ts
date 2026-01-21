class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private maxSize = 10;

  acquire(): HTMLCanvasElement {
    const canvas = this.pool.pop();
    if (canvas) {
      return canvas;
    }
    return document.createElement('canvas');
  }

  release(canvas: HTMLCanvasElement): void {
    if (this.pool.length < this.maxSize) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0;
      canvas.height = 0;
      this.pool.push(canvas);
    }
  }

  clear(): void {
    this.pool = [];
  }
}

export const canvasPool = new CanvasPool();
