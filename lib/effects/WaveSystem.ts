import { WaveConfig } from "../../types";

export class WaveSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private animationId: number = 0;
  private increment: number = 0;
  
  // Resize buffering
  private targetWidth: number = 0;
  private targetHeight: number = 0;
  private needsResize: boolean = false;

  private config: Required<WaveConfig> = {
    colorStart: '#1e1b4b',
    colorEnd: '#312e81',
    waveColor: 'rgba(129, 140, 248, 0.3)',
    speed: 1,
    amplitude: 50,
    parallax: 0.5
  };

  constructor(canvas: HTMLCanvasElement, config?: WaveConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("No context");
    this.ctx = ctx;
    
    // Initialize initial size
    this.width = canvas.width;
    this.height = canvas.height;
    
    if (config) this.updateConfig(config);
  }

  public updateConfig(config: WaveConfig) {
    this.config = { ...this.config, ...config };
  }

  public resize(width: number, height: number) {
    // Instead of resizing immediately (which clears canvas and causes flicker),
    // we queue the resize to happen synchronously at the start of the next frame.
    this.targetWidth = width;
    this.targetHeight = height;
    this.needsResize = true;
  }

  public start() {
    this.animate();
  }

  public stop() {
    cancelAnimationFrame(this.animationId);
  }

  private animate = () => {
    // 1. Handle Resize Phase
    if (this.needsResize) {
        this.width  = this.targetWidth;
        this.height = this.targetHeight;
        this.canvas.width  = this.targetWidth;
        this.canvas.height = this.targetHeight;
        // Lock CSS height to buffer so accordion height changes never CSS-stretch
        // the canvas and cause a visual jitter.
        this.canvas.style.height = this.targetHeight + 'px';
        this.needsResize = false;
    }

    // 2. Clear Phase
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 3. Draw Phase
    // Background Gradient - Only draw if not transparent
    if (this.config.colorStart !== 'transparent') {
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, this.config.colorStart);
        gradient.addColorStop(1, this.config.colorEnd || this.config.colorStart);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Determine Base Y Position
    // Parallax Logic:
    // We want the wave center to be at the center of the viewport.
    // However, if we just set y = centerViewport, it will move with the scroll 1:1 (fixed).
    // We want to control this "fixity" with the parallax factor.
    // 0 = Moves with content (Normal)
    // 1 = Moves with viewport (Fixed)
    
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const centerScreenY = viewportH * 0.5;
    
    // Get Canvas position relative to viewport
    // Note: getBoundingClientRect forces layout, but for a single active background it's usually acceptable.
    const canvasRect = this.canvas.getBoundingClientRect();
    
    // If parallax is 0, we want relative Y to be constant (e.g. center of canvas)
    // If parallax is 1, we want relative Y to compensate exactly for canvasTop
    
    const parallaxFactor = this.config.parallax ?? 0.5;
    
    // Calculate the offset.
    // If parallax is 1: offset = -canvasRect.top (pushes drawing down as canvas goes up)
    // If parallax is 0: offset = 0 (draws relative to canvas top)
    const yScrollOffset = -canvasRect.top * parallaxFactor;
    
    // We base the wave around the visual center of the screen, adjusted by parallax
    // When canvasTop is 0 (at top of screen), wave is at centerScreenY.
    // When canvasTop is negative (scrolled down), yScrollOffset becomes positive, pushing wave down.
    const centerY = centerScreenY + yScrollOffset;

    // Draw Waves
    this.drawWave(centerY, this.config.amplitude, 0.01, this.config.speed, this.config.waveColor);
    this.drawWave(centerY + 20, this.config.amplitude + 20, 0.005, this.config.speed * 1.5, this.adjustColorOpacity(this.config.waveColor, 0.7));
    this.drawWave(centerY - 20, this.config.amplitude - 10, 0.02, this.config.speed * 0.5, this.adjustColorOpacity(this.config.waveColor, 0.7));

    this.increment += 0.01;
    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawWave(yOffset: number, amplitude: number, frequency: number, speed: number, color: string) {
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, yOffset); // Start line (approx)
    
    // Optimization: Draw lines segment by segment.
    // If width is huge, this loop can be heavy.
    // Can increase step size (dx) for better performance if needed, e.g. x+=2
    for (let x = 0; x < this.width; x += 1) {
      this.ctx.lineTo(x, yOffset + Math.sin(x * frequency + this.increment * speed) * amplitude);
    }
    
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  // Helper to adjust opacity of an rgba string roughly
  private adjustColorOpacity(color: string, factor: number): string {
    if (color.startsWith('rgba')) {
       return color.replace(/[^,]+(?=\))/, (match) => (parseFloat(match) * factor).toFixed(2));
    }
    return color;
  }
}