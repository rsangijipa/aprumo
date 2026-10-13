import Matter from 'matter-js';
import type { TowerBlock, StabilityAssist } from '../types/tower';

export interface TowerEngineConfig {
  stabilityAssist: StabilityAssist;
  canKnockdown: boolean;
  lowSensory: boolean;
}

export class TowerPhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  public ground: Matter.Body;
  public blocks: TowerBlock[] = [];
  public config: TowerEngineConfig = {
    stabilityAssist: 2,
    canKnockdown: false,
    lowSensory: false,
  };

  private matterBodiesMap = new Map<string, Matter.Body>();
  public draggedBlockId: string | null = null;
  public lastAdultActionTime: number = Date.now();

  constructor(canvasWidth: number, canvasHeight: number) {
    // 1. Initialize Matter.js Engine with high solver iterations and sleeping
    this.engine = Matter.Engine.create({
      enableSleeping: true,
      positionIterations: 10,
      velocityIterations: 8,
    });
    this.world = this.engine.world;

    // Ground platform styled as the Vitória-Régia rubber mat
    const groundHeight = 50;
    this.ground = Matter.Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight - groundHeight / 2,
      canvasWidth * 0.95,
      groundHeight,
      {
        isStatic: true,
        friction: 1.0,
        render: { fillStyle: '#2d6a4f' },
      }
    );
    Matter.World.add(this.world, this.ground);
  }

  resize(canvasWidth: number, canvasHeight: number) {
    const groundHeight = 50;
    Matter.Body.setPosition(this.ground, {
      x: canvasWidth / 2,
      y: canvasHeight - groundHeight / 2,
    });
  }

  /**
   * Spawns unplaced blocks on adult or child side.
   * INVIOLABLE RULE: Child NEVER receives blocks autonomously.
   */
  spawnBlock(
    id: string,
    owner: 'adulto' | 'crianca',
    shape: 'retangular' | 'quadrado' | 'copo' | 'cilindro',
    color: string,
    x: number,
    y: number,
    width = 120,
    height = 42
  ): TowerBlock {
    const block: TowerBlock = {
      id,
      owner,
      shape,
      color,
      width,
      height,
      x,
      y,
      angle: 0,
      placedInTower: false,
    };
    this.blocks.push(block);
    return block;
  }

  /**
   * Starts dragging a block.
   * ARRASTO CINEMÁTICO: The dragged block is disconnected from collision physics
   * so moving it never knocks the tower down mid-drag!
   */
  startDrag(blockId: string) {
    this.draggedBlockId = blockId;
    const body = this.matterBodiesMap.get(blockId);
    if (body) {
      Matter.Body.setStatic(body, true);
      body.isSensor = true;
    }
  }

  updateDrag(blockId: string, x: number, y: number) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (block) {
      block.x = x;
      block.y = y;
      const body = this.matterBodiesMap.get(blockId);
      if (body) {
        Matter.Body.setPosition(body, { x, y });
      }
    }
  }

  /**
   * Drops dragged block onto the tower or returns to side.
   */
  endDrag(blockId: string, canvasWidth: number, canvasHeight: number): { placed: boolean; towerHeight: number } {
    this.draggedBlockId = null;
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return { placed: false, towerHeight: 0 };

    const centerX = canvasWidth / 2;
    const isNearCenter = Math.abs(block.x - centerX) < 140;

    // Placed blocks in tower
    const towerBlocks = this.blocks.filter((b) => b.placedInTower && b.id !== blockId);
    const topY = towerBlocks.length > 0 ? Math.min(...towerBlocks.map((b) => b.y)) : canvasHeight - 80;

    // Check if dropped near top of tower or ground
    if (isNearCenter && block.y < topY + 60) {
      // Snap to tower center based on stability assistance
      let finalX = block.x;
      const finalY = Math.min(block.y, topY - block.height / 2);

      if (this.config.stabilityAssist >= 1) {
        // Horizontal snap
        finalX = centerX + (Math.random() - 0.5) * (this.config.stabilityAssist === 1 ? 16 : 4);
      }

      block.x = finalX;
      block.y = finalY;
      block.placedInTower = true;

      // Create or update Matter body
      let body = this.matterBodiesMap.get(blockId);
      if (!body) {
        body = Matter.Bodies.rectangle(block.x, block.y, block.width, block.height, {
          density: 0.003,
          friction: 0.9,
          frictionStatic: 1.2,
          restitution: 0.05,
          frictionAir: 0.01,
        });
        this.matterBodiesMap.set(blockId, body);
        Matter.World.add(this.world, body);
      }

      body.isSensor = false;
      Matter.Body.setPosition(body, { x: finalX, y: finalY });
      Matter.Body.setAngle(body, 0);

      if (this.config.stabilityAssist >= 2) {
        // Generous stabilization: damp angular velocity
        Matter.Body.setAngularVelocity(body, 0);
        Matter.Body.setVelocity(body, { x: 0, y: 0.5 });
      }

      Matter.Body.setStatic(body, false);

      const newHeight = this.blocks.filter((b) => b.placedInTower).length;
      return { placed: true, towerHeight: newHeight };
    }

    // Otherwise return to owner side
    return { placed: false, towerHeight: towerBlocks.length };
  }

  /**
   * INVIOLABLE RULE: Tower can only be knocked down if adult unlocked canKnockdown!
   */
  knockdownTower(): boolean {
    if (!this.config.canKnockdown) return false;

    const towerBlocks = this.blocks.filter((b) => b.placedInTower);
    if (towerBlocks.length === 0) return false;

    // Apply lateral explosive force to middle and top blocks
    towerBlocks.forEach((block, idx) => {
      const body = this.matterBodiesMap.get(block.id);
      if (body) {
        Matter.Body.setStatic(body, false);
        body.isSensor = false;
        const dir = idx % 2 === 0 ? 1 : -1;
        const forceMagnitude = 0.04 + Math.random() * 0.06;
        Matter.Body.applyForce(body, body.position, {
          x: dir * forceMagnitude,
          y: -0.02 - Math.random() * 0.03,
        });
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
      }
    });

    // Reset knockdown permission
    this.config.canKnockdown = false;
    return true;
  }

  update(dt: number) {
    Matter.Engine.update(this.engine, dt * 1000);

    // Sync positions from Matter bodies to tower blocks
    for (const block of this.blocks) {
      if (block.placedInTower && block.id !== this.draggedBlockId) {
        const body = this.matterBodiesMap.get(block.id);
        if (body) {
          block.x = body.position.x;
          block.y = body.position.y;
          block.angle = body.angle;
        }
      }
    }
  }

  reset() {
    this.blocks = [];
    this.matterBodiesMap.forEach((body) => {
      Matter.World.remove(this.world, body);
    });
    this.matterBodiesMap.clear();
    this.draggedBlockId = null;
    this.config.canKnockdown = false;
    this.lastAdultActionTime = Date.now();
  }
}
