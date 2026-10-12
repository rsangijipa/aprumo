// src/game/scenes/BootScene.ts
// Procedural vector paper-cut asset generator.
// Creates high-resolution canvas textures directly in Phaser texture manager.

import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    // Show a warm loading message
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height / 2, '🎵 Afinando os instrumentos...', {
      fontFamily: 'Fredoka, Outfit, sans-serif',
      fontSize: '24px',
      color: '#FFF8E8',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 400,
    });
  }

  public create(): void {
    this.generateCharacterTextures();
    this.generateInstrumentProps();
    this.generateEffectTextures();

    // Proceed to MainMenu
    this.scene.start('MainMenuScene');
  }

  // ==========================================
  // PROCEDURAL TEXTURE GENERATION
  // ==========================================

  private generateCharacterTextures(): void {
    // 1. TICO (Maestro Bird)
    this.drawCanvasTexture('char_tico', 90, 110, (ctx) => {
      // Body (round bird)
      ctx.fillStyle = '#48CAE4';
      ctx.beginPath();
      ctx.arc(45, 65, 34, 0, Math.PI * 2);
      ctx.fill();

      // Belly
      ctx.fillStyle = '#FFF8E8';
      ctx.beginPath();
      ctx.arc(45, 72, 22, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#283B5B';
      ctx.beginPath();
      ctx.arc(36, 56, 4.5, 0, Math.PI * 2);
      ctx.arc(54, 56, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(38, 54, 1.8, 0, Math.PI * 2);
      ctx.arc(56, 54, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Beak (cheerful orange triangle)
      ctx.fillStyle = '#F3C24F';
      ctx.beginPath();
      ctx.moveTo(45, 60);
      ctx.lineTo(39, 68);
      ctx.lineTo(51, 68);
      ctx.closePath();
      ctx.fill();

      // Maestro Top Hat
      ctx.fillStyle = '#283B5B';
      ctx.beginPath();
      ctx.ellipse(45, 36, 26, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(27, 12, 36, 24);
      // Red hat band
      ctx.fillStyle = '#E96A5F';
      ctx.fillRect(27, 30, 36, 6);

      // Red bow tie
      ctx.fillStyle = '#E96A5F';
      ctx.beginPath();
      ctx.moveTo(45, 88);
      ctx.lineTo(34, 82);
      ctx.lineTo(34, 94);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(45, 88);
      ctx.lineTo(56, 82);
      ctx.lineTo(56, 94);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#F3C24F';
      ctx.beginPath();
      ctx.arc(45, 88, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. PIPOCA (Squirrel)
    this.drawCanvasTexture('char_pipoca', 90, 110, (ctx) => {
      // Fluffy Tail
      ctx.fillStyle = '#E76F51';
      ctx.beginPath();
      ctx.arc(70, 50, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F4A261';
      ctx.beginPath();
      ctx.arc(68, 50, 15, 0, Math.PI * 2);
      ctx.fill();

      // Body & Head
      ctx.fillStyle = '#E76F51';
      ctx.beginPath();
      ctx.arc(40, 68, 30, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.beginPath();
      ctx.ellipse(26, 40, 7, 14, -0.2, 0, Math.PI * 2);
      ctx.ellipse(52, 40, 7, 14, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Snout
      ctx.fillStyle = '#FFF8E8';
      ctx.beginPath();
      ctx.arc(40, 72, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#283B5B';
      ctx.beginPath();
      ctx.arc(40, 66, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.beginPath();
      ctx.arc(31, 58, 4, 0, Math.PI * 2);
      ctx.arc(49, 58, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. NINO (Bear)
    this.drawCanvasTexture('char_nino', 100, 110, (ctx) => {
      // Ears
      ctx.fillStyle = '#9C6644';
      ctx.beginPath();
      ctx.arc(28, 35, 12, 0, Math.PI * 2);
      ctx.arc(72, 35, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#DDB892';
      ctx.beginPath();
      ctx.arc(28, 35, 6, 0, Math.PI * 2);
      ctx.arc(72, 35, 6, 0, Math.PI * 2);
      ctx.fill();

      // Big Round Head & Body
      ctx.fillStyle = '#9C6644';
      ctx.beginPath();
      ctx.arc(50, 65, 36, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle
      ctx.fillStyle = '#DDB892';
      ctx.beginPath();
      ctx.ellipse(50, 72, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#283B5B';
      ctx.beginPath();
      ctx.ellipse(50, 66, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.beginPath();
      ctx.arc(38, 56, 4, 0, Math.PI * 2);
      ctx.arc(62, 56, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. MAYA (Cat)
    this.drawCanvasTexture('char_maya', 90, 110, (ctx) => {
      // Ears (pointy)
      ctx.fillStyle = '#B5838D';
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.lineTo(28, 25);
      ctx.lineTo(40, 45);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(50, 45);
      ctx.lineTo(62, 25);
      ctx.lineTo(70, 50);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(45, 65, 28, 0, Math.PI * 2);
      ctx.fill();

      // Cheeks & Whiskers
      ctx.fillStyle = '#FFF8E8';
      ctx.beginPath();
      ctx.arc(45, 70, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E96A5F';
      ctx.beginPath();
      ctx.arc(45, 67, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Cute Eyes
      ctx.fillStyle = '#283B5B';
      ctx.beginPath();
      ctx.arc(35, 58, 4, 0, Math.PI * 2);
      ctx.arc(55, 58, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. LILO (Bunny)
    this.drawCanvasTexture('char_lilo', 90, 110, (ctx) => {
      // Long Ears
      ctx.fillStyle = '#63A675';
      ctx.beginPath();
      ctx.ellipse(34, 28, 8, 22, -0.15, 0, Math.PI * 2);
      ctx.ellipse(56, 28, 8, 22, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#A3E4D7';
      ctx.beginPath();
      ctx.ellipse(34, 28, 4, 15, -0.15, 0, Math.PI * 2);
      ctx.ellipse(56, 28, 4, 15, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#63A675';
      ctx.beginPath();
      ctx.arc(45, 66, 28, 0, Math.PI * 2);
      ctx.fill();

      // Eyes & Snout
      ctx.fillStyle = '#FFF8E8';
      ctx.beginPath();
      ctx.arc(45, 72, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E96A5F';
      ctx.beginPath();
      ctx.arc(45, 68, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#283B5B';
      ctx.beginPath();
      ctx.arc(35, 60, 3.5, 0, Math.PI * 2);
      ctx.arc(55, 60, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. BENTO (Turtle)
    this.drawCanvasTexture('char_bento', 90, 110, (ctx) => {
      // Shell
      ctx.fillStyle = '#40916C';
      ctx.beginPath();
      ctx.arc(45, 65, 32, 0, Math.PI * 2);
      ctx.fill();
      // Shell segments
      ctx.strokeStyle = '#D8F3DC';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Head
      ctx.fillStyle = '#95D5B2';
      ctx.beginPath();
      ctx.arc(45, 40, 18, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#283B5B';
      ctx.beginPath();
      ctx.arc(38, 36, 3.5, 0, Math.PI * 2);
      ctx.arc(52, 36, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private generateInstrumentProps(): void {
    const ids = [
      'tambor', 'pandeiro', 'chocalho', 'palmas', 'triangulo',
      'agogo', 'xilofone', 'bloco', 'bumbo', 'caixa', 'prato', 'teclado'
    ];

    ids.forEach((id) => {
      this.drawCanvasTexture(`prop_${id}`, 48, 48, (ctx) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw small badge or symbol
        ctx.fillStyle = '#283B5B';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const emojis: Record<string, string> = {
          tambor: '🥁', pandeiro: '🪘', chocalho: '🪇', palmas: '👏',
          triangulo: '📐', agogo: '🔔', xilofone: '🎶', bloco: '🪵',
          bumbo: '🥁', caixa: '🪘', prato: '🟡', teclado: '🎹'
        };
        ctx.fillText(emojis[id] || '🎵', 24, 25);
      });
    });
  }

  private generateEffectTextures(): void {
    // 1. Star
    this.drawCanvasTexture('fx_star', 32, 32, (ctx) => {
      ctx.fillStyle = '#F3C24F';
      ctx.beginPath();
      const cx = 16, cy = 16, spikes = 5, outerR = 14, innerR = 6;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerR;
        let y = cy + Math.sin(rot) * outerR;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerR;
        y = cy + Math.sin(rot) * innerR;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerR);
      ctx.closePath();
      ctx.fill();
    });

    // 2. Paper-cut Pad Background
    this.drawCanvasTexture('ui_pad_bg', 96, 96, (ctx) => {
      ctx.fillStyle = '#FFFFFF';
      this.roundRect(ctx, 4, 4, 88, 88, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 4;
      ctx.stroke();
    });
  }

  private drawCanvasTexture(key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): void {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawFn(ctx);
      this.textures.addCanvas(key, canvas);
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
