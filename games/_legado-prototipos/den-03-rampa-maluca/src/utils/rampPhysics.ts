import Matter from 'matter-js';
import type { RampTrackConfig, VehicleType } from '../types/ramp';

export interface VehicleComposite {
  id: string;
  type: VehicleType;
  owner: 'adulto' | 'crianca';
  composite: Matter.Composite;
  chassis: Matter.Body;
  color: string;
}

export class RampPhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  public rampBody: Matter.Body | null = null;
  public groundBody: Matter.Body | null = null;
  public gateBody: Matter.Body | null = null;
  public pinBodies: Matter.Body[] = [];
  public vehicles: VehicleComposite[] = [];

  public isGateOpen: boolean = false;
  public onTargetHitCallback: (() => void) | null = null;
  public lastAdultActionTime: number = Date.now();

  constructor() {
    this.engine = Matter.Engine.create({
      enableSleeping: false,
      positionIterations: 10,
      velocityIterations: 8,
    });
    this.world = this.engine.world;

    this.setupCollisionEvents();
  }

  private setupCollisionEvents() {
    Matter.Events.on(this.engine, 'collisionStart', (evt) => {
      for (const pair of evt.pairs) {
        const isPinA = this.pinBodies.includes(pair.bodyA);
        const isPinB = this.pinBodies.includes(pair.bodyB);
        const isVehicleA = this.vehicles.some((v) => v.chassis === pair.bodyA);
        const isVehicleB = this.vehicles.some((v) => v.chassis === pair.bodyB);

        if ((isPinA && isVehicleB) || (isPinB && isVehicleA)) {
          this.onTargetHitCallback?.();
        }
      }
    });
  }

  buildTrack(config: RampTrackConfig, width: number, height: number) {
    Matter.World.clear(this.world, false);
    this.vehicles = [];
    this.pinBodies = [];
    this.isGateOpen = false;

    // Ground platform at bottom
    const groundH = 40;
    this.groundBody = Matter.Bodies.rectangle(width / 2, height - groundH / 2, width, groundH, {
      isStatic: true,
      friction: 0.8,
    });
    Matter.World.add(this.world, this.groundBody);

    // Ramp: inclined body from top-left downwards
    const angleRad = (config.rampAngleDeg * Math.PI) / 180;
    const rampLength = width * 0.72;
    const rampThickness = 28;

    // Center of ramp
    const startX = 60;
    const startY = 160;
    const rampCenterX = startX + (Math.cos(angleRad) * rampLength) / 2;
    const rampCenterY = startY + (Math.sin(angleRad) * rampLength) / 2;

    this.rampBody = Matter.Bodies.rectangle(rampCenterX, rampCenterY, rampLength, rampThickness, {
      isStatic: true,
      angle: angleRad,
      friction: 0.1,
    });
    Matter.World.add(this.world, this.rampBody);

    // Starting Gate / Trava at top of ramp
    const gateX = startX + 50;
    const gateY = startY - 20;
    this.gateBody = Matter.Bodies.rectangle(gateX, gateY, 18, 55, {
      isStatic: true,
      angle: angleRad,
    });
    Matter.World.add(this.world, this.gateBody);

    // Target Pins at the end of the flat track
    const endX = rampCenterX + (Math.cos(angleRad) * rampLength) / 2 + 60;
    const pinBaseY = height - groundH - 30;

    for (let p = 0; p < config.pinCount; p++) {
      const pin = Matter.Bodies.rectangle(endX + p * 28, pinBaseY, 14, 55, {
        density: 0.001,
        friction: 0.5,
        restitution: 0.3,
      });
      this.pinBodies.push(pin);
      Matter.World.add(this.world, pin);
    }
  }

  /**
   * Spawns vehicle composite (chassis + 2 wheels + constraints) at top of ramp behind gate.
   */
  spawnVehicle(id: string, type: VehicleType, owner: 'adulto' | 'crianca', color: string, startOffset = 0) {
    const startX = 85 + startOffset;
    const startY = 120 + startOffset * 0.4;

    const group = Matter.Body.nextGroup(true);
    const chassisWidth = type === 'onibus' ? 95 : type === 'caminhao' ? 85 : 70;
    const chassisHeight = 32;

    const chassis = Matter.Bodies.rectangle(startX, startY, chassisWidth, chassisHeight, {
      collisionFilter: { group },
      density: type === 'caminhao' ? 0.006 : 0.002,
      friction: 0.2,
    });

    const wheelRadius = 14;
    const wheelA = Matter.Bodies.circle(startX - chassisWidth * 0.35, startY + 18, wheelRadius, {
      collisionFilter: { group },
      friction: 0.9,
      restitution: 0.1,
    });
    const wheelB = Matter.Bodies.circle(startX + chassisWidth * 0.35, startY + 18, wheelRadius, {
      collisionFilter: { group },
      friction: 0.9,
      restitution: 0.1,
    });

    const axelA = Matter.Constraint.create({
      bodyA: chassis,
      pointA: { x: -chassisWidth * 0.35, y: 15 },
      bodyB: wheelA,
      stiffness: 0.9,
    });
    const axelB = Matter.Constraint.create({
      bodyA: chassis,
      pointA: { x: chassisWidth * 0.35, y: 15 },
      bodyB: wheelB,
      stiffness: 0.9,
    });

    const composite = Matter.Composite.create();
    Matter.Composite.add(composite, [chassis, wheelA, wheelB, axelA, axelB]);
    Matter.World.add(this.world, composite);

    const vehicleObj: VehicleComposite = {
      id,
      type,
      owner,
      composite,
      chassis,
      color,
    };
    this.vehicles.push(vehicleObj);
    return vehicleObj;
  }

  /**
   * INVIOLABLE RULE: Gate opens ONLY on adult action. Never launches automatically.
   */
  openGate(): boolean {
    if (this.isGateOpen || !this.gateBody) return false;

    this.lastAdultActionTime = Date.now();
    this.isGateOpen = true;
    Matter.World.remove(this.world, this.gateBody);

    // Apply gentle initial nudge to vehicles
    this.vehicles.forEach((v) => {
      Matter.Body.applyForce(v.chassis, v.chassis.position, { x: 0.008, y: 0.002 });
    });

    return true;
  }

  update(dt: number) {
    Matter.Engine.update(this.engine, dt * 1000);

    // Anti-tunneling speed clamping
    const maxSpeed = 26; // max px per frame
    this.vehicles.forEach((v) => {
      const spd = Math.hypot(v.chassis.velocity.x, v.chassis.velocity.y);
      if (spd > maxSpeed) {
        const factor = maxSpeed / spd;
        Matter.Body.setVelocity(v.chassis, {
          x: v.chassis.velocity.x * factor,
          y: v.chassis.velocity.y * factor,
        });
      }
    });
  }
}
