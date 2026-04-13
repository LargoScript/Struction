import { LavaLampConfig } from '../../types';

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number; // For horizontal sine wave movement
}

export class LavaLampSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blobs: Blob[] = [];
  private animationId: number = 0;
  private width: number = 0;
  private height: number = 0;

  private config: Required<Pick<LavaLampConfig, 'backgroundColor' | 'colors' | 'blobCount' | 'speed'>> = {
    backgroundColor: 'transparent',
    colors: ['#ff4500'],
    blobCount: 10,
    speed: 1,
  };

  constructor(canvas: HTMLCanvasElement, config?: LavaLampConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("No context");
    this.ctx = ctx;
    if (config) this.updateConfig(config);
  }

  public updateConfig(config: LavaLampConfig) {
    this.config = { ...this.config, ...config };
    // Re-init if count changes significantly or if empty
    if (this.blobs.length !== this.config.blobCount) {
        this.initBlobs();
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.initBlobs();
  }

  private initBlobs() {
    this.blobs = [];
    for (let i = 0; i < this.config.blobCount; i++) {
      this.blobs.push(this.createBlob());
    }
  }

  private createBlob(): Blob {
    const sizeBase = Math.min(this.width, this.height) * 0.15; // Responsive size
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height + this.height, // Start slightly below or random
      vx: 0,
      vy: (Math.random() * -1 - 0.5) * this.config.speed, // Upward movement
      radius: sizeBase * (0.8 + Math.random() * 1.2),
      phase: Math.random() * Math.PI * 2,
    };
  }

  public start() {
    this.animate();
  }

  public stop() {
    cancelAnimationFrame(this.animationId);
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Note: We don't draw background here to allow layering. 
    // The background is handled by the parent DIV.

    this.ctx.fillStyle = this.config.colors[0] || '#ff4500';

    this.blobs.forEach((blob) => {
      // Physics
      blob.y += blob.vy * this.config.speed;
      
      // Horizontal Sine Wave Oscillation
      blob.phase += 0.01 * this.config.speed;
      blob.x += Math.sin(blob.phase) * 0.5 * this.config.speed;

      // Reset if off top
      if (blob.y < -blob.radius * 2) {
        blob.y = this.height + blob.radius * 2;
        blob.x = Math.random() * this.width;
        // Randomize size slightly on respawn
        blob.radius = blob.radius * (0.9 + Math.random() * 0.2); 
      }

      // Draw
      this.ctx.beginPath();
      this.ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(this.animate);
  };
}