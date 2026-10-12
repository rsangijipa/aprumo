// src/game/characters/BandCharacter.ts
// Paper-cut concert musicians with beat-synced idle bounce, anticipation, hit, and dance.

import Phaser from 'phaser';
import { InstrumentId } from '../../audio/synth';

export interface CharacterConfig {
  id: string;
  name: string;
  instrumentId: InstrumentId;
  textureKey: string;
  scale?: number;
}

export class BandCharacter extends Phaser.GameObjects.Container {
  public characterId: string;
  public characterName: string;
  public instrumentId: InstrumentId;
  
  private bodySprite: Phaser.GameObjects.Sprite;
  private instrumentSprite: Phaser.GameObjects.Sprite;
  private nameText: Phaser.GameObjects.Text;
  private glowCircle: Phaser.GameObjects.Arc;

  private baseScale = 1.0;
  private isDancing = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: CharacterConfig) {
    super(scene, x, y);
    this.characterId = config.id;
    this.characterName = config.name;
    this.instrumentId = config.instrumentId;
    this.baseScale = config.scale ?? 1.0;

    // Glowing stage ring beneath the character
    this.glowCircle = scene.add.circle(0, 48, 56, 0xffffff, 0.15);
    this.add(this.glowCircle);

    // Body sprite
    this.bodySprite = scene.add.sprite(0, 0, config.textureKey);
    this.add(this.bodySprite);

    // Instrument sprite overlay (e.g. baton for Tico, drum for Pipoca)
    this.instrumentSprite = scene.add.sprite(22, 10, `prop_${config.instrumentId}`);
    this.add(this.instrumentSprite);

    // Character name tag
    this.nameText = scene.add.text(0, 68, config.name, {
      fontFamily: 'Fredoka, Outfit, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
      stroke: '#283B5B',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(this.nameText);

    this.setScale(this.baseScale);
    scene.add.existing(this);
  }

  /**
   * Called on every musical beat to give the characters an infectious, organic groove.
   */
  public onBeat(beatInBar: number): void {
    if (this.isDancing) return;

    // Gentle bounce synced to the BPM
    const targetScaleY = beatInBar === 0 ? this.baseScale * 1.12 : this.baseScale * 1.06;
    const targetScaleX = beatInBar === 0 ? this.baseScale * 0.92 : this.baseScale * 0.96;

    this.scene.tweens.add({
      targets: this,
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      duration: 110,
      ease: 'Quad.easeOut',
      yoyo: true,
    });

    // Subtle side sway
    const angle = beatInBar % 2 === 0 ? 3.5 : -3.5;
    this.scene.tweens.add({
      targets: this.bodySprite,
      angle,
      duration: 160,
      ease: 'Sine.easeInOut',
      yoyo: true,
    });
  }

  /**
   * Play an energetic hit animation when the character's instrument is triggered.
   */
  public triggerHit(): void {
    // Squash & stretch pop
    this.scene.tweens.killTweensOf(this);
    this.setScale(this.baseScale * 1.25, this.baseScale * 0.82);

    this.scene.tweens.add({
      targets: this,
      scaleX: this.baseScale,
      scaleY: this.baseScale,
      duration: 220,
      ease: 'Back.easeOut',
    });

    // Arm / instrument strike
    this.scene.tweens.add({
      targets: this.instrumentSprite,
      angle: -25,
      scale: 1.3,
      duration: 70,
      ease: 'Quad.easeOut',
      yoyo: true,
    });

    // Flash glow ring
    this.glowCircle.setAlpha(0.65);
    this.scene.tweens.add({
      targets: this.glowCircle,
      alpha: 0.15,
      duration: 300,
    });
  }

  /**
   * Victory / Combo celebration dance!
   */
  public celebrate(): void {
    this.isDancing = true;
    this.scene.tweens.add({
      targets: this,
      y: this.y - 28,
      duration: 200,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.isDancing = false;
      },
    });

    this.scene.tweens.add({
      targets: this.bodySprite,
      angle: 360,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.bodySprite.setAngle(0);
      },
    });
  }
}
