import Matter from 'matter-js';
import type { BinDefinition, SensoryProfile, SortItem } from '../types';

export interface PhysicsCallbacks {
  onItemEnterBin: (item: SortItem, bin: BinDefinition, velocity: number) => void;
  onItemReturnToTray: (item: SortItem) => void;
}

export class SortMatterWorld {
  private engine: Matter.Engine;
  private runner: Matter.Runner | null = null;
  private render: Matter.Render | null = null;
  private mouseConstraint: Matter.MouseConstraint | null = null;
  private containerElement: HTMLElement;
  private callbacks: PhysicsCallbacks;
  private sensoryProfile: SensoryProfile = 'padrao';

  private binBodies: Map<string, { container: Matter.Body; sensor: Matter.Body; bin: BinDefinition }> = new Map();
  private itemBodies: Map<string, { body: Matter.Body; item: SortItem; idleTimer?: ReturnType<typeof setTimeout> }> = new Map();
  private debouncedItems: Set<string> = new Set();

  private width: number;
  private height: number;

  constructor(container: HTMLElement, callbacks: PhysicsCallbacks, sensoryProfile: SensoryProfile = 'padrao') {
    this.containerElement = container;
    this.callbacks = callbacks;
    this.sensoryProfile = sensoryProfile;

    this.width = container.clientWidth || 960;
    this.height = container.clientHeight || 640;

    // Create Engine with Matter.js parameters (Section 7)
    this.engine = Matter.Engine.create({
      gravity: {
        x: 0,
        y: this.sensoryProfile === 'baixo' ? 0.6 : 0.9,
        scale: 0.001
      }
    });

    this.initWorld();
  }

  private initWorld() {
    const { Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

    // Render Canvas
    this.render = Render.create({
      element: this.containerElement,
      engine: this.engine,
      options: {
        width: this.width,
        height: this.height,
        wireframes: false,
        background: '#FBF9F5',
        showVelocity: false
      }
    });

    Render.run(this.render);
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);

    // Invisible boundary walls (Section 7: "Paredes invisíveis nas bordas")
    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      render: { visible: false },
      friction: 0.8
    };

    const thickness = 60;
    const floor = Bodies.rectangle(this.width / 2, this.height + thickness / 2 - 10, this.width * 2, thickness, wallOptions);
    const ceiling = Bodies.rectangle(this.width / 2, -thickness / 2, this.width * 2, thickness, wallOptions);
    const leftWall = Bodies.rectangle(-thickness / 2, this.height / 2, thickness, this.height * 2, wallOptions);
    const rightWall = Bodies.rectangle(this.width + thickness / 2, this.height / 2, thickness, this.height * 2, wallOptions);

    Composite.add(this.engine.world, [floor, ceiling, leftWall, rightWall]);

    // Mouse & Touch Constraint (Section 7: "MouseConstraint stiffness 0.2")
    const mouse = Mouse.create(this.render.canvas);
    this.mouseConstraint = MouseConstraint.create(this.engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    // Velocity limiter (Section 7: "Velocidade máxima limitada a 25 px/frame")
    Matter.Events.on(this.engine, 'beforeUpdate', () => {
      this.itemBodies.forEach(({ body }) => {
        const maxVelocity = this.sensoryProfile === 'baixo' ? 12 : 25;
        const currentSpeed = body.speed;
        if (currentSpeed > maxVelocity) {
          const factor = maxVelocity / currentSpeed;
          Matter.Body.setVelocity(body, {
            x: body.velocity.x * factor,
            y: body.velocity.y * factor
          });
        }
      });
    });

    // Collision detection on bin sensors (Section 7 & 12: "Debounce por item")
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        // Check if one body is sensor and other is item
        this.binBodies.forEach(({ sensor, bin }) => {
          const otherBody = bodyA === sensor ? bodyB : bodyB === sensor ? bodyA : null;
          if (otherBody) {
            for (const entry of this.itemBodies.values()) {
              if (entry.body === otherBody) {
                const { item, body } = entry;
                if (!this.debouncedItems.has(item.id)) {
                  this.debouncedItems.add(item.id);
                  const vel = Math.round(body.speed * 10) / 10;
                  this.callbacks.onItemEnterBin(item, bin, vel);
                }
                break;
              }
            }
          }
        });
      });
    });

    Composite.add(this.engine.world, this.mouseConstraint);
    this.render.mouse = mouse;
  }

  /**
   * Set up U-shaped Bins with sensors at mouth
   */
  public setupBins(bins: BinDefinition[]) {
    // Clear old bin bodies
    this.binBodies.forEach(({ container, sensor }) => {
      Matter.Composite.remove(this.engine.world, [container, sensor]);
    });
    this.binBodies.clear();

    const binCount = bins.length;
    const binWidth = Math.min(220, (this.width - 60) / binCount - 20);
    const binHeight = 160;
    const wallThick = 12;
    const yPos = 140;

    const spacing = this.width / (binCount + 1);

    bins.forEach((bin, idx) => {
      const xPos = spacing * (idx + 1);

      // Left, bottom, right walls form U-shape
      const leftW = Matter.Bodies.rectangle(xPos - binWidth / 2 + wallThick / 2, yPos, wallThick, binHeight, {
        isStatic: true,
        render: { fillStyle: bin.color, opacity: 0.9 }
      });

      const rightW = Matter.Bodies.rectangle(xPos + binWidth / 2 - wallThick / 2, yPos, wallThick, binHeight, {
        isStatic: true,
        render: { fillStyle: bin.color, opacity: 0.9 }
      });

      const bottomW = Matter.Bodies.rectangle(xPos, yPos + binHeight / 2 - wallThick / 2, binWidth, wallThick, {
        isStatic: true,
        render: { fillStyle: bin.color, opacity: 0.9 }
      });

      const container = Matter.Body.create({
        parts: [leftW, rightW, bottomW],
        isStatic: true
      });

      // Sensor at mouth of bin
      const sensor = Matter.Bodies.rectangle(xPos, yPos - binHeight / 2 + 25, binWidth - wallThick * 2, 35, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: 'transparent' }
      });

      this.binBodies.set(bin.id, { container, sensor, bin });
      Matter.Composite.add(this.engine.world, [container, sensor]);
    });
  }

  /**
   * Spawns a draggable item into the tray/conveyor zone
   */
  public spawnItem(item: SortItem, x?: number, y?: number): Matter.Body {
    const startX = x !== undefined ? x : this.width / 2;
    const startY = y !== undefined ? y : this.height - 110;

    const radius = item.size === 'pequeno' ? 24 : item.size === 'grande' ? 44 : 34;

    // Body with Section 7 parameters: restitution: 0.2, friction: 0.6, frictionAir: 0.02, density: 0.002
    const body = Matter.Bodies.circle(startX, startY, radius, {
      restitution: this.sensoryProfile === 'baixo' ? 0 : 0.2,
      friction: 0.6,
      frictionAir: 0.02,
      density: 0.002,
      render: {
        fillStyle: item.color,
        strokeStyle: '#1E252B',
        lineWidth: 2
      }
    });

    this.itemBodies.set(item.id, { body, item });
    Matter.Composite.add(this.engine.world, body);

    return body;
  }

  /**
   * Resets item position smoothly back to tray
   */
  public returnItemToTray(itemId: string) {
    const entry = this.itemBodies.get(itemId);
    if (!entry) return;

    this.debouncedItems.delete(itemId);
    const { body } = entry;

    // Animate smoothly back to center tray
    Matter.Body.setVelocity(body, { x: 0, y: -4 });
    Matter.Body.setPosition(body, {
      x: this.width / 2 + (Math.random() * 60 - 30),
      y: this.height - 110
    });
  }

  public removeItem(itemId: string) {
    const entry = this.itemBodies.get(itemId);
    if (entry) {
      Matter.Composite.remove(this.engine.world, entry.body);
      this.itemBodies.delete(itemId);
      this.debouncedItems.delete(itemId);
    }
  }

  public clearAllItems() {
    this.itemBodies.forEach(({ body }) => {
      Matter.Composite.remove(this.engine.world, body);
    });
    this.itemBodies.clear();
    this.debouncedItems.clear();
  }

  public setSensoryProfile(profile: SensoryProfile) {
    this.sensoryProfile = profile;
    this.engine.gravity.y = profile === 'baixo' ? 0.6 : 0.9;
  }

  public destroy() {
    if (this.runner) Matter.Runner.stop(this.runner);
    if (this.render) Matter.Render.stop(this.render);
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
  }
}
