// src/game/scenes/MainMenuScene.ts
// Main Menu Screen with 8 Game Modes, 7 Stages, Settings & Calibration.

import Phaser from 'phaser';
import { STAGES } from '../../data/stages';
import { soundSynth } from '../../audio/synth';
import { transport } from '../../audio/transport';

export interface GameModeInfo {
  id: string;
  name: string;
  badge: string;
  icon: string;
  color: string;
  desc: string;
}

export const GAME_MODES: GameModeInfo[] = [
  {
    id: 'brinca_som',
    name: '1. Brinca Som',
    badge: 'Livre',
    icon: '🪇',
    color: '#63A675',
    desc: 'Sandbox musical livre! Toque instrumentos sem regras ou limites.',
  },
  {
    id: 'faz_igual',
    name: '2. Faz Igual',
    badge: 'Turnos',
    icon: '🦜',
    color: '#E96A5F',
    desc: 'Tico toca uma frase e você repete no mesmo ritmo!',
  },
  {
    id: 'eco_musical',
    name: '3. Eco Musical',
    badge: 'Memória',
    icon: '👂',
    color: '#8A79C7',
    desc: 'Ouça a sequência com atenção antes que as pistas sumam.',
  },
  {
    id: 'complete_compasso',
    name: '4. Complete o Compasso',
    badge: 'Ritmo',
    icon: '⏱️',
    color: '#F3C24F',
    desc: 'A banda toca e deixa o espaço certinho para sua batida!',
  },
  {
    id: 'crie_seu_beat',
    name: '5. Crie Seu Beat',
    badge: 'Criação',
    icon: '🎛️',
    color: '#48CAE4',
    desc: 'Sequenciador visual para criar e salvar seus próprios ritmos.',
  },
  {
    id: 'banda_junto',
    name: '6. Banda Junto',
    badge: 'Ao Vivo',
    icon: '🥁',
    color: '#F4A261',
    desc: 'Toque junto com a banda ao vivo e desbloqueie novas camadas!',
  },
  {
    id: 'dueto',
    name: '7. Dueto',
    badge: '2 Jogadores',
    icon: '🤝',
    color: '#06D6A0',
    desc: 'Dois jogadores no mesmo teclado ou tablet cooperando juntos!',
  },
  {
    id: 'maestro',
    name: '8. Maestro',
    badge: 'Regência',
    icon: '🪄',
    color: '#B5838D',
    desc: 'Comande quem toca e quem descansa no concerto da banda.',
  },
];

export default class MainMenuScene extends Phaser.Scene {
  private selectedStageIndex = 0;
  private stageText!: Phaser.GameObjects.Text;
  private stageSubtext!: Phaser.GameObjects.Text;
  private stageBgRect!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('MainMenuScene');
  }

  public create(): void {
    const { width, height } = this.scale;

    // Background gradient canvas or rectangle
    this.stageBgRect = this.add.rectangle(width / 2, height / 2, width, height, 0x283b5b);

    // Decorative paper-cut bunting header
    this.createHeaderBunting(width);

    // Header Title
    const title = this.add.text(width / 2, 45, '🎶 BANDA DO TICO 🎶', {
      fontFamily: 'Fredoka, Outfit, sans-serif',
      fontSize: '34px',
      color: '#FFF8E8',
      stroke: '#1B263B',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: 1.03,
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut',
    });

    this.add.text(width / 2, 80, 'Concerto Musical Infantil — Toque, Crie e Sinta o Ritmo!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#F3C24F',
    }).setOrigin(0.5);

    // Stage Selector Carousel Banner
    this.createStageSelector(width / 2, 115);

    // 8 Mode Cards Grid (2 rows x 4 columns)
    this.createModeCardsGrid(width, height);

    // Footer Action Bar (Settings, Calibration, Library)
    this.createFooterBar(width, height);
  }

  private createHeaderBunting(width: number): void {
    const buntingColors = [0xe96a5f, 0xf3c24f, 0x63a675, 0x8a79c7, 0x48cae4];
    const flagWidth = 32;
    const count = Math.ceil(width / flagWidth);

    for (let i = 0; i < count; i++) {
      const col = buntingColors[i % buntingColors.length];
      const tri = this.add.triangle(
        i * flagWidth + 16,
        10,
        0, 0,
        flagWidth, 0,
        flagWidth / 2, 16,
        col
      );
      tri.setOrigin(0.5, 0);
    }
  }

  private createStageSelector(cx: number, cy: number): void {
    const stage = STAGES[this.selectedStageIndex];

    const container = this.add.container(cx, cy);

    // Pill background
    const pill = this.add.rectangle(0, 0, 480, 40, 0x1b263b, 0.7);
    pill.setStrokeStyle(2, 0xf3c24f);
    container.add(pill);

    // Left Arrow
    const btnLeft = this.add.text(-215, 0, '◀', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#F3C24F',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnLeft.on('pointerdown', () => this.cycleStage(-1));
    container.add(btnLeft);

    // Right Arrow
    const btnRight = this.add.text(215, 0, '▶', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#F3C24F',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnRight.on('pointerdown', () => this.cycleStage(1));
    container.add(btnRight);

    // Stage Name Text
    this.stageText = this.add.text(0, -6, `Palco: ${stage.name}`, {
      fontFamily: 'Fredoka, Outfit, sans-serif',
      fontSize: '16px',
      color: '#FFF8E8',
    }).setOrigin(0.5);
    container.add(this.stageText);

    this.stageSubtext = this.add.text(0, 10, stage.subtitle, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#D8E2DC',
    }).setOrigin(0.5);
    container.add(this.stageSubtext);
  }

  private cycleStage(dir: number): void {
    soundSynth.playUIPop();
    this.selectedStageIndex =
      (this.selectedStageIndex + dir + STAGES.length) % STAGES.length;
    const stage = STAGES[this.selectedStageIndex];
    this.stageText.setText(`Palco: ${stage.name}`);
    this.stageSubtext.setText(stage.subtitle);

    // Update background color tint
    const hex = parseInt(stage.skyColorTop.replace('#', '0x'), 16);
    this.stageBgRect.setFillStyle(hex);
  }

  private createModeCardsGrid(width: number, _height: number): void {
    const cols = 4;
    const cardW = 220;
    const cardH = 150;
    const startX = (width - (cols * cardW + (cols - 1) * 20)) / 2 + cardW / 2;
    const startY = 230;

    GAME_MODES.forEach((mode, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = startX + c * (cardW + 20);
      const y = startY + r * (cardH + 18);

      this.createModeCard(x, y, cardW, cardH, mode);
    });
  }

  private createModeCard(x: number, y: number, w: number, h: number, mode: GameModeInfo): void {
    const card = this.add.container(x, y);

    // Base card shadow
    const shadow = this.add.rectangle(3, 4, w, h, 0x000000, 0.25);
    card.add(shadow);

    // Card Body
    const colorNum = parseInt(mode.color.replace('#', '0x'), 16);
    const body = this.add.rectangle(0, 0, w, h, 0xfff8e8);
    body.setStrokeStyle(3, colorNum);
    card.add(body);

    // Top color strip
    const topStrip = this.add.rectangle(0, -h / 2 + 15, w, 30, colorNum);
    card.add(topStrip);

    // Badge
    const badge = this.add.text(w / 2 - 12, -h / 2 + 15, mode.badge, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      color: '#FFFFFF',
      backgroundColor: '#283B5B',
      padding: { left: 6, right: 6, top: 2, bottom: 2 },
    }).setOrigin(1, 0.5);
    card.add(badge);

    // Icon
    const icon = this.add.text(-w / 2 + 20, -h / 2 + 15, mode.icon, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5);
    card.add(icon);

    // Title
    const title = this.add.text(0, -18, mode.name, {
      fontFamily: 'Fredoka, Outfit, sans-serif',
      fontSize: '17px',
      color: '#283B5B',
    }).setOrigin(0.5);
    card.add(title);

    // Description
    const desc = this.add.text(0, 22, mode.desc, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#495057',
      align: 'center',
      wordWrap: { width: w - 24 },
      lineSpacing: 2,
    }).setOrigin(0.5);
    card.add(desc);

    // Play action indicator
    const playPrompt = this.add.text(0, h / 2 - 16, '▶ JOGAR AGORA', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: mode.color,
    }).setOrigin(0.5);
    card.add(playPrompt);

    // Make card interactive with tactile pop
    body.setInteractive({ useHandCursor: true });

    body.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scale: 1.05,
        y: y - 5,
        duration: 120,
        ease: 'Quad.easeOut',
      });
      body.setFillStyle(0xffffff);
    });

    body.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scale: 1.0,
        y,
        duration: 120,
        ease: 'Quad.easeOut',
      });
      body.setFillStyle(0xfff8e8);
    });

    body.on('pointerdown', () => {
      soundSynth.playUIPop();
      this.launchGame(mode.id);
    });
  }

  private createFooterBar(width: number, height: number): void {
    const y = height - 32;

    const buttons = [
      { text: '⚙️ Configurações', action: () => window.dispatchEvent(new CustomEvent('open-audio-settings')) },
      { text: '🎯 Calibrar Toque', action: () => window.dispatchEvent(new CustomEvent('open-calibration')) },
      { text: '📚 Biblioteca de Ritmos', action: () => window.dispatchEvent(new CustomEvent('open-rhythm-library')) },
      { text: '🎹 Sequenciador', action: () => this.launchGame('crie_seu_beat') },
    ];

    const totalW = buttons.length * 190;
    const startX = (width - totalW) / 2 + 95;

    buttons.forEach((btn, i) => {
      const bx = startX + i * 190;
      const b = this.add.container(bx, y);

      const bg = this.add.rectangle(0, 0, 175, 36, 0x1b263b, 0.85);
      bg.setStrokeStyle(1.5, 0xf3c24f);
      b.add(bg);

      const txt = this.add.text(0, 0, btn.text, {
        fontFamily: 'Fredoka, Outfit, sans-serif',
        fontSize: '13px',
        color: '#FFF8E8',
      }).setOrigin(0.5);
      b.add(txt);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        bg.setFillStyle(0x283b5b, 1.0);
        b.setScale(1.04);
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(0x1b263b, 0.85);
        b.setScale(1.0);
      });
      bg.on('pointerdown', () => {
        soundSynth.playUIPop();
        btn.action();
      });
    });
  }

  private launchGame(modeId: string): void {
    const stage = STAGES[this.selectedStageIndex];
    transport.bpm = stage.defaultBpm;
    this.scene.start('PlayScene', {
      mode: modeId,
      stage: stage,
    });
  }
}
