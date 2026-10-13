import Phaser from 'phaser';
import { WorldState } from '../simulation/WorldState';
import { useGameStore } from '../store/gameStore';
import { soundEngine } from '../audio/SoundEngine';
import { ALL_ITEMS } from '../data/items';

export class ParkScene extends Phaser.Scene {
  private world!: WorldState;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key; // Use
  private keyF!: Phaser.Input.Keyboard.Key; // Help
  private keyQ!: Phaser.Input.Keyboard.Key; // Comms
  private keySpace!: Phaser.Input.Keyboard.Key; // Special

  // P2 keys
  private keyI!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyL!: Phaser.Input.Keyboard.Key;
  private keyO!: Phaser.Input.Keyboard.Key; // P2 Use
  private keyP!: Phaser.Input.Keyboard.Key; // P2 Help

  // Graphics layers
  private groundLayer!: Phaser.GameObjects.Graphics;
  private objectLayer!: Phaser.GameObjects.Graphics;
  private fxLayer!: Phaser.GameObjects.Graphics;
  private uiLayer!: Phaser.GameObjects.Graphics;

  // Touch & Mouse
  private pointerDownTime: number = 0;
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 };
  private touchTarget: { x: number; y: number } | null = null;

  // Ripple / water animation
  private waterAnimPhase: number = 0;

  constructor() {
    super({ key: 'ParkScene' });
  }

  create() {
    const store = useGameStore.getState();
    if (!store.worldState) return;
    this.world = store.worldState;

    // Setup input keys
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
      this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
      this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
      this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
      this.keyO = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
      this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    // Layers
    this.groundLayer = this.add.graphics();
    this.objectLayer = this.add.graphics();
    this.fxLayer = this.add.graphics();
    this.uiLayer = this.add.graphics();

    // Camera setup
    const mapWidthPx = this.world.mapDef.gridWidth * 32;
    const mapHeightPx = this.world.mapDef.gridHeight * 32;
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.setBackgroundColor('#283033');

    // Pointer events for Ping and Tap-To-Move
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerDownTime = Date.now();
      this.pointerDownPos = { x: pointer.worldX, y: pointer.worldY };
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const duration = Date.now() - this.pointerDownTime;
      const dist = Math.hypot(pointer.worldX - this.pointerDownPos.x, pointer.worldY - this.pointerDownPos.y);

      if (dist < 15) {
        if (duration > 350) {
          // Long press -> Drop Ping!
          const p1 = this.world.players[0];
          this.world.addPing(pointer.worldX, pointer.worldY, p1.name, p1.characterDef.appearance.color, 'Pin');
          soundEngine.playCommPing();
        } else {
          // Short tap -> Move target or interact
          this.touchTarget = { x: pointer.worldX, y: pointer.worldY };
          this.handleTapInteraction(pointer.worldX, pointer.worldY);
        }
      }
    });
  }

  private handleTapInteraction(worldX: number, worldY: number) {
    const p1 = this.world.players[0];

    // Check click near ground items
    const clickedItem = this.world.groundItems.find(it => Math.hypot(it.x - worldX, it.y - worldY) < 32);
    if (clickedItem) {
      if (Math.hypot(p1.x - clickedItem.x, p1.y - clickedItem.y) < 48) {
        const picked = this.world.playerPickupItem(p1.id, clickedItem.id);
        if (picked) soundEngine.playHammerTap();
      }
      return;
    }

    // Check click near wheelbarrow
    if (Math.hypot(this.world.wheelbarrow.x - worldX, this.world.wheelbarrow.y - worldY) < 40) {
      // Toggle pushing
      const isPushing = this.world.wheelbarrow.pushingPlayerIds.includes(p1.id);
      if (isPushing) {
        this.world.wheelbarrow.pushingPlayerIds = this.world.wheelbarrow.pushingPlayerIds.filter(id => id !== p1.id);
      } else {
        this.world.wheelbarrow.pushingPlayerIds.push(p1.id);
      }
    }
  }

  update(time: number, delta: number) {
    const dt = delta / 1000;
    this.waterAnimPhase += dt * 1.5;

    // Store sync check
    const store = useGameStore.getState();
    if (!store.worldState || store.worldState.isMatchEnded) {
      if (store.worldState?.isMatchEnded && store.currentScreen === 'game') {
        store.finishMatchWithStats(store.worldState.stats!);
      }
      return;
    }

    // 1. Process Player 1 Input
    this.handlePlayer1Input(dt);

    // 2. Process Player 2 Input (if local_2p)
    if (this.world.gameMode === 'local_2p' && this.world.players.length > 1) {
      this.handlePlayer2Input(dt);
    }

    // 3. Update Wheelbarrow motion
    this.updateWheelbarrowMotion(dt);

    // 4. Update Simulation
    this.world.update(dt);

    // 5. Render Scene
    this.renderDiorama();
  }

  private handlePlayer1Input(dt: number) {
    const p1 = this.world.players[0];
    let dx = 0;
    let dy = 0;

    if (this.keyA?.isDown || this.cursors?.left?.isDown) dx -= 1;
    if (this.keyD?.isDown || this.cursors?.right?.isDown) dx += 1;
    if (this.keyW?.isDown || this.cursors?.up?.isDown) dy -= 1;
    if (this.keyS?.isDown || this.cursors?.down?.isDown) dy += 1;

    // Tap to move override
    if (this.touchTarget) {
      const tdx = this.touchTarget.x - p1.x;
      const tdy = this.touchTarget.y - p1.y;
      const dist = Math.hypot(tdx, tdy);
      if (dist > 10) {
        dx = tdx / dist;
        dy = tdy / dist;
      } else {
        this.touchTarget = null;
      }
    }

    const isMoving = dx !== 0 || dy !== 0;
    if (isMoving) {
      const len = Math.hypot(dx, dy);
      const speed = p1.characterDef.talent === 'agil' ? 195 : 165;
      p1.vx = (dx / len) * speed;
      p1.vy = (dy / len) * speed;
      p1.x += p1.vx * dt;
      p1.y += p1.vy * dt;
      p1.facingAngle = Math.atan2(dy, dx);

      // Boundaries
      p1.x = Phaser.Math.Clamp(p1.x, 20, this.world.mapDef.gridWidth * 32 - 20);
      p1.y = Phaser.Math.Clamp(p1.y, 20, this.world.mapDef.gridHeight * 32 - 20);
    } else {
      p1.vx = 0;
      p1.vy = 0;
    }

    // Interaction key E (Use / Pickup)
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.interactClosest(p1);
    }

    // Help key F
    p1.isHelping = !!this.keyF?.isDown;
    if (p1.isHelping && Math.random() < 0.05) {
      soundEngine.playCoopSparkle();
    }

    // Special action (Space)
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      if (p1.specialCooldownRemaining <= 0) {
        p1.specialCooldownRemaining = p1.characterDef.specialCooldown;
        p1.currentSpeechBubble = `✨ ${p1.characterDef.specialActionName}!`;
        p1.speechBubbleTimer = 3.0;
        soundEngine.playCoopSparkle();
      }
    }

    // Comms Wheel (Q)
    if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      useGameStore.getState().openQuickComms(true);
    }
  }

  private handlePlayer2Input(dt: number) {
    const p2 = this.world.players[1];
    let dx = 0;
    let dy = 0;

    if (this.keyJ?.isDown) dx -= 1;
    if (this.keyL?.isDown) dx += 1;
    if (this.keyI?.isDown) dy -= 1;
    if (this.keyK?.isDown) dy += 1;

    const isMoving = dx !== 0 || dy !== 0;
    if (isMoving) {
      const len = Math.hypot(dx, dy);
      const speed = p2.characterDef.talent === 'agil' ? 195 : 165;
      p2.vx = (dx / len) * speed;
      p2.vy = (dy / len) * speed;
      p2.x += p2.vx * dt;
      p2.y += p2.vy * dt;
      p2.facingAngle = Math.atan2(dy, dx);

      p2.x = Phaser.Math.Clamp(p2.x, 20, this.world.mapDef.gridWidth * 32 - 20);
      p2.y = Phaser.Math.Clamp(p2.y, 20, this.world.mapDef.gridHeight * 32 - 20);
    } else {
      p2.vx = 0;
      p2.vy = 0;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyO)) {
      this.interactClosest(p2);
    }

    p2.isHelping = !!this.keyP?.isDown;
  }

  private interactClosest(player: any) {
    // 1. Pickup nearby ground item
    const nearbyGroundItem = this.world.groundItems.find(
      it => Math.hypot(it.x - player.x, it.y - player.y) < 40
    );
    if (nearbyGroundItem) {
      const ok = this.world.playerPickupItem(player.id, nearbyGroundItem.id);
      if (ok) soundEngine.playHammerTap();
      return;
    }

    // 2. Wheelbarrow attach / detach
    const cartDist = Math.hypot(this.world.wheelbarrow.x - player.x, this.world.wheelbarrow.y - player.y);
    if (cartDist < 45) {
      const isPushing = this.world.wheelbarrow.pushingPlayerIds.includes(player.id);
      if (isPushing) {
        this.world.wheelbarrow.pushingPlayerIds = this.world.wheelbarrow.pushingPlayerIds.filter(id => id !== player.id);
      } else {
        this.world.wheelbarrow.pushingPlayerIds.push(player.id);
      }
    }
  }

  private updateWheelbarrowMotion(dt: number) {
    const cart = this.world.wheelbarrow;
    const pushers = this.world.players.filter(p => cart.pushingPlayerIds.includes(p.id));

    if (pushers.length > 0) {
      // Keep cart ahead of primary pusher
      const leadPusher = pushers[0];
      const forwardDist = 28;
      const targetCartX = leadPusher.x + Math.cos(leadPusher.facingAngle) * forwardDist;
      const targetCartY = leadPusher.y + Math.sin(leadPusher.facingAngle) * forwardDist;

      cart.x += (targetCartX - cart.x) * Math.min(1, 8 * dt);
      cart.y += (targetCartY - cart.y) * Math.min(1, 8 * dt);
    }
  }

  // --- Aesthetic Rendering (Top-down 2.5D Diorama) ---

  private renderDiorama() {
    this.groundLayer.clear();
    this.objectLayer.clear();
    this.fxLayer.clear();
    this.uiLayer.clear();

    const gw = this.world.mapDef.gridWidth;
    const gh = this.world.mapDef.gridHeight;

    // 1. Base Lawn
    this.groundLayer.fillStyle(0x5e8c61, 1);
    this.groundLayer.fillRect(0, 0, gw * 32, gh * 32);

    // Subtle grass texture checker
    for (let gx = 0; gx < gw; gx += 2) {
      for (let gy = 0; gy < gh; gy += 2) {
        this.groundLayer.fillStyle(0x659568, 0.4);
        this.groundLayer.fillRect(gx * 32, gy * 32, 32, 32);
      }
    }

    // 2. Zones (Sand, Deck, Paths)
    this.world.mapDef.zones.forEach(zone => {
      const zx = zone.x * 32;
      const zy = zone.y * 32;
      const zw = zone.width * 32;
      const zh = zone.height * 32;

      let color = 0xe8dcc8; // Sand default
      let alpha = 0.85;

      if (zone.id === 'lago') {
        color = 0x4f8198;
        alpha = 0.95;
      } else if (zone.id === 'palco') {
        color = 0xd9a441;
        alpha = 0.7;
      } else if (zone.id === 'área de piquenique') {
        color = 0xb46d4f;
        alpha = 0.6;
      } else if (zone.id === 'quadra') {
        color = 0x4f8198;
        alpha = 0.65;
      } else if (zone.id === 'depósito' || zone.id === 'oficina') {
        color = 0x3d4a4d;
        alpha = 0.8;
      }

      this.groundLayer.fillStyle(color, alpha);
      this.groundLayer.fillRoundedRect(zx, zy, zw, zh, 8);

      // Border line
      this.groundLayer.lineStyle(2, 0x283033, 0.2);
      this.groundLayer.strokeRoundedRect(zx, zy, zw, zh, 8);
    });

    // 3. Decorations (Trees, Ponds, Stages, Benches, Lights)
    this.world.mapDef.decorations.forEach(dec => {
      const dx = dec.x * 32;
      const dy = dec.y * 32;

      if (dec.type === 'tree') {
        // Tree shadow
        this.groundLayer.fillStyle(0x1a2420, 0.25);
        this.groundLayer.fillEllipse(dx + 4, dy + 8, 38, 22);

        // Trunk
        this.objectLayer.fillStyle(0x8d5524, 1);
        this.objectLayer.fillRect(dx - 4, dy - 2, 8, 12);

        // Canopy (stylized layers)
        this.objectLayer.fillStyle(0x3e6b41, 1);
        this.objectLayer.fillCircle(dx, dy - 10, 22);
        this.objectLayer.fillStyle(0x5e8c61, 1);
        this.objectLayer.fillCircle(dx - 3, dy - 13, 17);
        this.objectLayer.fillStyle(0x7da880, 0.8);
        this.objectLayer.fillCircle(dx - 6, dy - 16, 10);
      } else if (dec.type === 'pond') {
        const pw = (dec.width || 6) * 32;
        const ph = (dec.height || 4) * 32;

        // Animated gentle ripples
        this.groundLayer.fillStyle(0x3a6d85, 1);
        this.groundLayer.fillRoundedRect(dx, dy, pw, ph, 16);

        this.groundLayer.lineStyle(2, 0xaad8e6, 0.6);
        const rippleR = 12 + Math.sin(this.waterAnimPhase) * 4;
        this.groundLayer.strokeEllipse(dx + pw / 2, dy + ph / 2, rippleR * 2, rippleR);
      } else if (dec.type === 'bench') {
        // Wooden park bench
        this.objectLayer.fillStyle(0x8d5524, 1);
        this.objectLayer.fillRoundedRect(dx - 12, dy - 6, 24, 12, 3);
        this.objectLayer.fillStyle(0xb46d4f, 1);
        this.objectLayer.fillRect(dx - 10, dy - 4, 20, 4);
      } else if (dec.type === 'lamp') {
        // Solar Lamp post
        this.objectLayer.fillStyle(0x283033, 1);
        this.objectLayer.fillRect(dx - 2, dy - 18, 4, 20);
        this.objectLayer.fillStyle(0xd9a441, 0.9);
        this.objectLayer.fillCircle(dx, dy - 20, 6);
        // Light aura
        this.groundLayer.fillStyle(0xffe699, 0.15);
        this.groundLayer.fillCircle(dx, dy - 10, 36);
      } else if (dec.type === 'ramp') {
        // Accessible ramp with guide lines
        const rw = (dec.width || 6) * 32;
        const rh = (dec.height || 2) * 32;
        this.groundLayer.fillStyle(0xe8dcc8, 0.95);
        this.groundLayer.fillRoundedRect(dx, dy, rw, rh, 6);
        this.groundLayer.lineStyle(2, 0x4f8198, 0.8);
        this.groundLayer.strokeRoundedRect(dx, dy, rw, rh, 6);
      }
    });

    // 4. Task Spots & Transformations
    this.world.mapDef.taskSpots.forEach(spot => {
      const sx = spot.x * 32 + 16;
      const sy = spot.y * 32 + 16;
      const state = this.world.activeTasks.get(spot.taskId);
      const isDone = state?.isCompleted || false;

      // Base pedestal
      this.groundLayer.fillStyle(isDone ? 0x5e8c61 : 0xd9a441, isDone ? 0.35 : 0.25);
      this.groundLayer.fillCircle(sx, sy, 22);

      // Task object visual
      if (isDone) {
        // Completed: blooming tree / painted bench / shining light
        this.objectLayer.fillStyle(0x5e8c61, 1);
        this.objectLayer.fillCircle(sx, sy - 8, 14);
        // Checkmark badge
        this.uiLayer.fillStyle(0x5e8c61, 1);
        this.uiLayer.fillCircle(sx + 10, sy - 18, 9);
        this.uiLayer.lineStyle(2, 0xffffff, 1);
        this.uiLayer.beginPath();
        this.uiLayer.moveTo(sx + 7, sy - 18);
        this.uiLayer.lineTo(sx + 10, sy - 15);
        this.uiLayer.lineTo(sx + 14, sy - 21);
        this.uiLayer.strokePath();
      } else {
        // Incomplete: needs work icon & outline
        this.objectLayer.lineStyle(2, 0xd9a441, 0.9);
        this.objectLayer.strokeCircle(sx, sy - 8, 13);
        this.objectLayer.fillStyle(0xffffff, 0.8);
        this.objectLayer.fillCircle(sx, sy - 8, 8);

        // Circular progress ring if being worked on
        if (state && state.progress > 0) {
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + (state.progress / 100) * Math.PI * 2;
          this.uiLayer.lineStyle(4, 0x5e8c61, 1);
          this.uiLayer.beginPath();
          this.uiLayer.arc(sx, sy - 8, 16, startAngle, endAngle);
          this.uiLayer.strokePath();

          // Percentage text or small badge
          this.uiLayer.fillStyle(0x283033, 0.85);
          this.uiLayer.fillRoundedRect(sx - 16, sy - 34, 32, 14, 4);
        }
      }
    });

    // 5. Ground Items
    this.world.groundItems.forEach(item => {
      const itemDef = ALL_ITEMS[item.itemId];
      const color = itemDef ? parseInt(itemDef.color.replace('#', '0x'), 16) : 0xd9a441;

      // Small item shadow
      this.groundLayer.fillStyle(0x1a2420, 0.2);
      this.groundLayer.fillEllipse(item.x, item.y + 4, 14, 8);

      // Item icon pill
      this.objectLayer.fillStyle(color, 1);
      this.objectLayer.fillCircle(item.x, item.y, 7);
      this.objectLayer.lineStyle(1.5, 0xffffff, 0.9);
      this.objectLayer.strokeCircle(item.x, item.y, 7);
    });

    // 6. Wheelbarrow
    const cart = this.world.wheelbarrow;
    this.groundLayer.fillStyle(0x1a2420, 0.25);
    this.groundLayer.fillRoundedRect(cart.x - 14, cart.y - 10, 28, 20, 4);

    // Wooden cart body
    this.objectLayer.fillStyle(0xb46d4f, 1);
    this.objectLayer.fillRoundedRect(cart.x - 12, cart.y - 10, 24, 18, 4);
    this.objectLayer.lineStyle(2, 0x8d5524, 1);
    this.objectLayer.strokeRoundedRect(cart.x - 12, cart.y - 10, 24, 18, 4);

    // Cart wheel
    this.objectLayer.fillStyle(0x283033, 1);
    this.objectLayer.fillCircle(cart.x + 10, cart.y, 4);

    // Items stacked inside cart
    cart.items.forEach((it, idx) => {
      if (it) {
        this.objectLayer.fillStyle(0xd9a441, 1);
        this.objectLayer.fillCircle(cart.x - 6 + (idx % 2) * 8, cart.y - 4 + Math.floor(idx / 2) * 8, 4);
      }
    });

    // 7. Players (Avatar, Wheelchair, Hat, Eye Direction, Speech Bubbles)
    this.world.players.forEach(player => {
      this.renderPlayer(player);
    });

    // 8. Dynamic Event Overlays (Rain particles, caution ribbons)
    if (this.world.activeEvent && this.world.activeEvent.phase === 'active') {
      if (this.world.activeEvent.def.type === 'weather') {
        // Gentle rain streaks
        this.fxLayer.lineStyle(1.5, 0x4f8198, 0.4);
        for (let r = 0; r < 40; r++) {
          const rx = (r * 37 + this.waterAnimPhase * 120) % (gw * 32);
          const ry = (r * 43 + this.waterAnimPhase * 240) % (gh * 32);
          this.fxLayer.lineBetween(rx, ry, rx + 4, ry + 12);
        }
      }
    }

    // 9. Pings with pulse ring
    const now = Date.now();
    this.world.pings.forEach(ping => {
      const age = (now - ping.timestamp) / 1000;
      const pulse = (age % 1.2) / 1.2;
      const radius = 10 + pulse * 28;
      const alpha = 1 - pulse;

      this.fxLayer.lineStyle(2.5, 0xd9a441, alpha);
      this.fxLayer.strokeCircle(ping.x, ping.y, radius);

      this.fxLayer.fillStyle(0xd9a441, 0.9);
      this.fxLayer.fillCircle(ping.x, ping.y, 7);
    });
  }

  private renderPlayer(player: any) {
    const px = player.x;
    const py = player.y;
    const app = player.characterDef.appearance;
    const color = parseInt(app.color.replace('#', '0x'), 16);
    const hair = parseInt(app.hairColor.replace('#', '0x'), 16);

    // 1. Shadow
    this.groundLayer.fillStyle(0x1a2420, 0.3);
    this.groundLayer.fillEllipse(px, py + 8, 22, 12);

    // 2. Wheelchair (if applicable - e.g. Maya)
    if (app.hasWheelchair) {
      this.objectLayer.lineStyle(2.5, 0x4f8198, 1);
      // Wheels
      this.objectLayer.strokeCircle(px - 10, py, 9);
      this.objectLayer.strokeCircle(px + 10, py, 9);
      // Frame
      this.objectLayer.fillStyle(0x283033, 1);
      this.objectLayer.fillRect(px - 8, py - 4, 16, 5);
    }

    // 3. Torso / Body (Circular soft diorama avatar)
    this.objectLayer.fillStyle(color, 1);
    this.objectLayer.fillCircle(px, py - 4, 12);

    // 4. Head
    this.objectLayer.fillStyle(hair, 1);
    this.objectLayer.fillCircle(px, py - 14, 9);

    // 5. Face / eyes looking in movement direction
    const eyeDist = 4;
    const ex = px + Math.cos(player.facingAngle) * eyeDist;
    const ey = py - 14 + Math.sin(player.facingAngle) * eyeDist;
    this.objectLayer.fillStyle(0xffffff, 1);
    this.objectLayer.fillCircle(ex - 2, ey, 2);
    this.objectLayer.fillCircle(ex + 2, ey, 2);
    this.objectLayer.fillStyle(0x283033, 1);
    this.objectLayer.fillCircle(ex - 2, ey, 1);
    this.objectLayer.fillCircle(ex + 2, ey, 1);

    // 6. Name label & Stamina pip
    this.uiLayer.fillStyle(0x283033, 0.7);
    this.uiLayer.fillRoundedRect(px - 18, py - 32, 36, 12, 3);

    // Helper heart indicator
    if (player.isHelping) {
      this.uiLayer.fillStyle(0xe25555, 1);
      this.uiLayer.fillCircle(px, py - 38, 5);
    }

    // 7. Speech Bubble
    if (player.currentSpeechBubble) {
      const bubbleW = Math.min(160, player.currentSpeechBubble.length * 8 + 16);
      this.uiLayer.fillStyle(0xffffff, 0.95);
      this.uiLayer.fillRoundedRect(px - bubbleW / 2, py - 52, bubbleW, 20, 6);
      this.uiLayer.lineStyle(1.5, 0x4f8198, 1);
      this.uiLayer.strokeRoundedRect(px - bubbleW / 2, py - 52, bubbleW, 20, 6);

      // Tail
      this.uiLayer.fillStyle(0xffffff, 0.95);
      this.uiLayer.fillTriangle(px - 4, py - 32, px + 4, py - 32, px, py - 26);
    }
  }
}
