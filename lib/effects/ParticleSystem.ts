import { ParticleConfig } from '../../types';

interface Particle {
  x: number;
  y: number;
  // Ambient velocity (constant drift)
  baseVx: number;
  baseVy: number;
  // Induced velocity (from mouse interaction)
  inducedVx: number;
  inducedVy: number;
  size: number;
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number = 0;
  private width: number = 0;
  private height: number = 0;
  private mouse = { x: -9999, y: -9999 };

  // Computed particle count (from density × area, updated on resize)
  private computedCount: number = 80;

  // Default Configuration
  private config: Required<ParticleConfig> = {
    particleDensity: 0.8, // ~80 particles on a 1280×800 canvas (1 024 000 px²)
    particleCount: 80,    // legacy fallback, used only when particleDensity is absent
    connectionDistance: 248,
    mouseDistance: 125,
    particleColor: 'rgba(100, 200, 255, 0.7)',
    lineColor: 'rgba(100, 200, 255, 0.2)',
    baseSpeed: 0.8,
    interactionStrength: 0.3, 
    resistance: 0.76,
    enableMouseInteraction: true,
    wrapAround: false,
    backgroundColor: 'transparent',
  };

  constructor(canvas: HTMLCanvasElement, config?: ParticleConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    
    if (config) {
      this.config = { ...this.config, ...config };
      this.initParticles();
    }
  }

  public updateConfig(newConfig: ParticleConfig) {
    this.config = { ...this.config, ...newConfig };
    // Re-init if density or count changed
    if (newConfig.particleDensity !== undefined || newConfig.particleCount !== undefined) {
      this.recomputeCount();
      this.initParticles();
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.recomputeCount();
    this.initParticles();
  }

  private recomputeCount() {
    const area = this.width * this.height;
    if (this.config.particleDensity && area > 0) {
      this.computedCount = Math.round(this.config.particleDensity * area / 100_000);
      // Clamp to sane range
      this.computedCount = Math.max(10, Math.min(this.computedCount, 300));
    } else {
      this.computedCount = this.config.particleCount;
    }
  }

  public updateMouse(x: number, y: number) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  private initParticles() {
    this.particles = [];
    // Safety check for 0 width (initial render)
    const w = this.width || this.canvas.width || window.innerWidth;
    const h = this.height || this.canvas.height || window.innerHeight;

    for (let i = 0; i < this.computedCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseVx: (Math.random() - 0.5) * this.config.baseSpeed,
        baseVy: (Math.random() - 0.5) * this.config.baseSpeed,
        inducedVx: 0,
        inducedVy: 0,
        size: Math.random() * 2 + 1,
      });
    }
  }

  public start() {
    if (!this.animationId) {
        this.animate();
    }
  }

  public stop() {
    cancelAnimationFrame(this.animationId);
    this.animationId = 0;
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Physics & Draw Loop
    this.particles.forEach((p, i) => {
      // 1. Apply Velocities
      // Total velocity = Base (ambient) + Induced (force)
      p.x += p.baseVx + p.inducedVx;
      p.y += p.baseVy + p.inducedVy;

      // 2. Apply Resistance (Friction) to Induced Velocity
      // This slowly reduces the push force back to 0
      p.inducedVx *= this.config.resistance;
      p.inducedVy *= this.config.resistance;

      // Cleanup tiny induced velocities to prevent infinite floating point math
      if (Math.abs(p.inducedVx) < 0.01) p.inducedVx = 0;
      if (Math.abs(p.inducedVy) < 0.01) p.inducedVy = 0;

      // 3. Boundary Handling (Wrap vs Bounce)
      if (this.config.wrapAround) {
        // Wrap Logic: If it goes off one side, appear on the other
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;
      } else {
        // Bounce Logic: Reflect velocity
        if (p.x < 0 || p.x > this.width) {
          p.baseVx *= -1;
          p.inducedVx *= -1;
          // Keep inside to prevent sticking
          p.x = Math.max(0, Math.min(this.width, p.x));
        }
        if (p.y < 0 || p.y > this.height) {
          p.baseVy *= -1;
          p.inducedVy *= -1;
          p.y = Math.max(0, Math.min(this.height, p.y));
        }
      }

      // 4. Mouse Interaction (Only if enabled)
      if (this.config.enableMouseInteraction) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.mouseDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          
          // Smoother force curve: Linear falloff
          const force = (this.config.mouseDistance - distance) / this.config.mouseDistance;
          
          // Push away
          const power = force * this.config.interactionStrength;
          
          // Add to induced velocity
          p.inducedVx -= forceDirectionX * power;
          p.inducedVy -= forceDirectionY * power;
        }
      }

      // 5. Draw Particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.particleColor;
      this.ctx.fill();

      // 6. Draw Connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx2 = p.x - p2.x;
        const dy2 = p.y - p2.y;
        
        // Optimization: Quick check before square root
        if (Math.abs(dx2) > this.config.connectionDistance || Math.abs(dy2) > this.config.connectionDistance) continue;

        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (dist2 < this.config.connectionDistance) {
            this.ctx.beginPath();
            // Smoother alpha transition
            const alpha = 1 - Math.pow(dist2 / this.config.connectionDistance, 2); 
            
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = this.config.lineColor;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        }
      }
    });

    this.animationId = requestAnimationFrame(this.animate);
  }
}