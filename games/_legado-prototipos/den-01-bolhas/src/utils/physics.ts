import type { Bubble, PopParticle, VariationType } from '../types/bubble';

export interface SimConfig {
  buoyancy: number; // -18 px/s²
  terminalVelocity: number; // -60 px/s
  drag: number; // 0.985
  isPaused: boolean;
  pauseDecay: number; // 0 to 1 decay factor during expectant pause
  lowSensory: boolean;
  maxBubbles: number;
}

export class BubbleEngine {
  public bubbles: Bubble[] = [];
  public particles: PopParticle[] = [];
  public config: SimConfig = {
    buoyancy: -18,
    terminalVelocity: -60,
    drag: 0.985,
    isPaused: false,
    pauseDecay: 1.0,
    lowSensory: false,
    maxBubbles: 60,
  };

  public lastAdultActionTime: number = Date.now();
  public totalPopped: number = 0;
  public totalSpawned: number = 0;

  private pauseTransitionStartTime: number | null = null;
  private idCounter: number = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.bubbles = [];
    this.particles = [];
    this.totalPopped = 0;
    this.totalSpawned = 0;
    this.lastAdultActionTime = Date.now();
    this.config.isPaused = false;
    this.config.pauseDecay = 1.0;
    this.pauseTransitionStartTime = null;
  }

  setExpectantPause(paused: boolean) {
    this.config.isPaused = paused;
    this.pauseTransitionStartTime = Date.now();
    if (!paused) {
      this.config.pauseDecay = 1.0;
    }
  }

  setLowSensory(enabled: boolean) {
    this.config.lowSensory = enabled;
    this.config.maxBubbles = enabled ? 18 : 60;
  }

  /**
   * ONLY the adult (via button or microphone) can spawn bubbles.
   * Child touches NEVER call this function.
   */
  spawnAdultBubbles(
    count: number,
    width: number,
    height: number,
    variation: VariationType = 'normal',
    customHue?: number
  ): number {
    this.lastAdultActionTime = Date.now();

    const allowed = Math.min(count, this.config.maxBubbles - this.bubbles.length);
    if (allowed <= 0) return 0;

    const bottleX = width / 2;
    const bottleY = height - 120;

    for (let i = 0; i < allowed; i++) {
      this.idCounter++;
      let radius = 60 + Math.random() * 40; // 60 to 100px standard
      let special: Bubble['isSpecial'] = 'normal';

      if (variation === 'gigantes') {
        radius = 130 + Math.random() * 60; // 130 to 190px
        special = 'gigante';
      } else if (variation === 'peixe') {
        special = 'peixe';
        radius = 75 + Math.random() * 30;
      } else if (variation === 'chuva') {
        radius = 50 + Math.random() * 30;
      } else if (variation === 'lentas') {
        radius = 70 + Math.random() * 40;
      }

      if (this.config.lowSensory) {
        radius = Math.min(radius, 100);
      }

      // Initial impulse emerging from the soap wand
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
      const initialSpeed = 80 + Math.random() * 120;
      const vx = Math.cos(angle) * initialSpeed;
      const vy = Math.sin(angle) * initialSpeed;

      const bubble: Bubble = {
        id: `b-${this.idCounter}-${Date.now()}`,
        x: bottleX + (Math.random() - 0.5) * 40,
        y: bottleY - Math.random() * 20,
        vx,
        vy,
        radius,
        colorHue: customHue !== undefined ? customHue : Math.floor(Math.random() * 360),
        isSpecial: special,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 2 + Math.random() * 2,
        createdAt: Date.now(),
        opacity: 0.95,
      };

      this.bubbles.push(bubble);
      this.totalSpawned++;
    }

    return allowed;
  }

  /**
   * INVIOLABLE RULE: Child touch on canvas ONLY pops existing bubbles.
   * Child touch NEVER generates new bubbles.
   */
  handleChildTouch(x: number, y: number): { popped: boolean; bubble?: Bubble } {
    // Find highest z-index / nearest bubble under touch
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      const dist = Math.hypot(b.x - x, b.y - y);
      if (dist <= b.radius * 1.05) {
        // Hit! Pop it
        this.popBubbleAtIndex(i);
        this.totalPopped++;
        return { popped: true, bubble: b };
      }
    }
    return { popped: false };
  }

  popBubbleAtIndex(index: number): Bubble | null {
    if (index < 0 || index >= this.bubbles.length) return null;
    const [b] = this.bubbles.splice(index, 1);

    // Create pop particles if not low sensory
    if (!this.config.lowSensory) {
      const particleCount = 6;
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 40 + Math.random() * 60;
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 3 + Math.random() * 3,
          alpha: 1.0,
          color: `hsla(${b.colorHue}, 85%, 65%, 0.8)`,
        });
      }
    }
    return b;
  }

  update(dt: number, width: number, _height: number, currentTime?: number) {
    const now = currentTime !== undefined ? currentTime : Date.now();

    // 1. Handle expectant pause transition (400ms deceleration)
    if (this.config.isPaused) {
      if (this.pauseTransitionStartTime) {
        const elapsed = now - this.pauseTransitionStartTime;
        if (elapsed < 400) {
          this.config.pauseDecay = 1.0 - elapsed / 400;
        } else {
          this.config.pauseDecay = 0.05;
        }
      } else {
        this.config.pauseDecay = 0.05;
      }
    } else {
      this.config.pauseDecay = 1.0;
    }

    // 2. Check 20-second inactivity rest rule
    const idleTimeSec = (now - this.lastAdultActionTime) / 1000;
    if (idleTimeSec > 20 && this.bubbles.length > 0) {
      // Gently pop one bubble every ~600ms until scene rests
      if (Math.random() < 0.03) {
        this.popBubbleAtIndex(0);
      }
    }

    // 3. Update bubbles physics
    const speedMult = this.config.lowSensory ? 0.6 : 1.0;
    const effectiveDecay = this.config.pauseDecay * speedMult;

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];

      // Lateral drift harmonic calculation
      b.wobblePhase += b.wobbleSpeed * dt;
      const drift = Math.sin(b.wobblePhase) * 25;

      // Buoyancy acceleration
      let targetBuoyancy = this.config.buoyancy;
      if (b.isSpecial === 'peixe') {
        targetBuoyancy = -10;
      } else if (b.isSpecial === 'gigante') {
        targetBuoyancy = -14;
      }

      b.vy += targetBuoyancy * dt;
      if (b.vy < this.config.terminalVelocity) {
        b.vy = this.config.terminalVelocity;
      }

      // Apply drag
      b.vx *= Math.pow(this.config.drag, dt * 60);
      b.vy *= Math.pow(this.config.drag, dt * 60);

      // Integrate position
      b.x += (b.vx + drift) * dt * effectiveDecay;
      b.y += b.vy * dt * effectiveDecay;

      // Soft bounce on horizontal boundaries
      if (b.x - b.radius < 10) {
        b.x = 10 + b.radius;
        b.vx = Math.abs(b.vx) * 0.6;
      } else if (b.x + b.radius > width - 10) {
        b.x = width - 10 - b.radius;
        b.vx = -Math.abs(b.vx) * 0.6;
      }

      // Check if floated off screen top
      if (b.y + b.radius < -50) {
        this.bubbles.splice(i, 1);
      }
    }

    // 4. Bubble-to-bubble soft repulsion
    for (let i = 0; i < this.bubbles.length; i++) {
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const b1 = this.bubbles[i];
        const b2 = this.bubbles[j];
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dist > 0.001) {
          const overlap = (minDist - dist) / dist;
          const force = overlap * 12 * dt;
          b1.x -= dx * force;
          b1.y -= dy * force;
          b2.x += dx * force;
          b2.y += dy * force;
        }
      }
    }

    // 5. Update pop particles
    for (let p = this.particles.length - 1; p >= 0; p--) {
      const pt = this.particles[p];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha -= 2.5 * dt; // vanishes in ~400ms
      if (pt.alpha <= 0) {
        this.particles.splice(p, 1);
      }
    }
  }
}
