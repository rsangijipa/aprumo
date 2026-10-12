// src/game/fx/JuiceFX.ts
// Visual juice, trauma-based screen shake, particle ripples, floating musical notes, and confetti.

import Phaser from 'phaser';
import confetti from 'canvas-confetti';

export class JuiceFX {
  private scene: Phaser.Scene;
  private trauma = 0.0;
  private maxOffset = 8;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public addTrauma(amount: number): void {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public update(deltaSeconds: number): void {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - 2.5 * deltaSeconds);
      const shake = this.trauma * this.trauma;
      const offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
      const offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.scene.cameras.main.setScroll(offsetX, offsetY);
    } else {
      this.scene.cameras.main.setScroll(0, 0);
    }
  }

  /**
   * Spawns an expanding, fading ripple ring at the tap point.
   */
  public spawnRipple(x: number, y: number, colorHex: number): void {
    const ring = this.scene.add.circle(x, y, 16);
    ring.setStrokeStyle(3, colorHex, 0.9);
    ring.setFillStyle(colorHex, 0.2);

    this.scene.tweens.add({
      targets: ring,
      radius: 65,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  /**
   * Spawns cheerful star particles bursting outward on successful hit.
   */
  public spawnStarBurst(x: number, y: number, count = 6, colorHex = 0xf3c24f): void {
    for (let i = 0; i < count; i++) {
      const star = this.scene.add.sprite(x, y, 'fx_star');
      star.setTint(colorHex);
      star.setScale(Phaser.Math.FloatBetween(0.5, 0.9));

      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.2, 0.2);
      const speed = Phaser.Math.Between(50, 110);
      const destX = x + Math.cos(angle) * speed;
      const destY = y + Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: star,
        x: destX,
        y: destY,
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(350, 500),
        ease: 'Cubic.easeOut',
        onComplete: () => star.destroy(),
      });
    }
  }

  /**
   * Spawns floating musical note icons that drift upward and fade.
   */
  public spawnFloatingNote(x: number, y: number, noteSymbol = '♪', color = '#FFF8E8'): void {
    const note = this.scene.add.text(x, y, noteSymbol, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color,
      stroke: '#283B5B',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: note,
      y: y - 55,
      x: x + Phaser.Math.Between(-25, 25),
      alpha: 0,
      scale: 1.3,
      duration: 650,
      ease: 'Sine.easeOut',
      onComplete: () => note.destroy(),
    });
  }

  /**
   * Triggers festive paper-cut confetti explosion across the screen (e.g. combo milestone).
   */
  public triggerConfetti(): void {
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E96A5F', '#F3C24F', '#63A675', '#8A79C7', '#48CAE4'],
      disableForReducedMotion: true,
    });
  }
}
