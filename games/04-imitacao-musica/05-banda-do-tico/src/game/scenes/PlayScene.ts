// src/game/scenes/PlayScene.ts
// The central musical concert stage supporting all 8 game modes, 3 visual rhythm views,
// 12 instruments, dynamic stem layering, and the paper-cut band.

import Phaser from 'phaser';
import { StageDef, STAGES } from '../../data/stages';
import { INSTRUMENTS, InstrumentDef, INSTRUMENT_MAP } from '../../data/instruments';
import { InstrumentId, soundSynth } from '../../audio/synth';
import { transport } from '../../audio/transport';
import { audioScheduler, NoteEvent } from '../../audio/scheduler';
import { rhythmJudge, RhythmAttempt } from '../../rhythm/scoring/judgment';
import { PATTERNS_LIBRARY, RhythmPattern } from '../../rhythm/patterns/library';
import { BandCharacter } from '../characters/BandCharacter';
import { JuiceFX } from '../fx/JuiceFX';
import { beatSequencer } from '../../composer/Sequencer';
import { storageManager } from '../../save/storage';

export default class PlayScene extends Phaser.Scene {
  private stageDef!: StageDef;
  private currentModeId = 'brinca_som';
  private juice!: JuiceFX;

  // Characters
  private characters: BandCharacter[] = [];

  // Rhythm Visualization Mode
  private visualMode: 'pulse' | 'track' | 'pictogram' = 'pulse';
  private rhythmContainer!: Phaser.GameObjects.Container;
  private trackNotes: { sprite: Phaser.GameObjects.Container; beat: number; instrumentId: InstrumentId }[] = [];

  // Active Pattern for structured modes
  private currentPatternIndex = 0;
  private currentPattern!: RhythmPattern;

  // Call & Response / Turn State (Faz Igual & Eco Musical)
  private turnState: 'listen' | 'play' | 'free' = 'free';
  private turnText!: Phaser.GameObjects.Text;
  private turnIndicatorBar!: Phaser.GameObjects.Rectangle;
  private callNotesPlayed: InstrumentId[] = [];
  private playerResponseNotes: InstrumentId[] = [];

  // Instrument Pads
  private padsContainer!: Phaser.GameObjects.Container;
  private activeInstrumentBank = 0; // 0: primary 4 instruments, 1: secondary 4, 2: tertiary 4

  // HUD Elements
  private comboText!: Phaser.GameObjects.Text;
  private comboLayerText!: Phaser.GameObjects.Text;
  private bpmText!: Phaser.GameObjects.Text;
  private pulseCircle!: Phaser.GameObjects.Arc;
  private playPauseBtnText!: Phaser.GameObjects.Text;

  // Maestro mode states (instruments active)
  private maestroActiveInstruments = new Set<InstrumentId>([
    'bumbo', 'caixa', 'chocalho', 'pandeiro', 'triangulo', 'teclado'
  ]);

  constructor() {
    super('PlayScene');
  }

  public init(data: { mode?: string; stage?: StageDef }): void {
    this.currentModeId = data.mode || 'brinca_som';
    this.stageDef = data.stage || STAGES[0];
    this.currentPatternIndex = 0;
    this.currentPattern = PATTERNS_LIBRARY[0];
    this.callNotesPlayed = [];
    this.playerResponseNotes = [];
    rhythmJudge.resetSession();

    const settings = storageManager.getSettings();
    this.visualMode = settings.visualMode || 'pulse';
  }

  public create(): void {
    const { width, height } = this.scale;
    this.juice = new JuiceFX(this);

    // 1. Stage Background
    this.buildStageBackground(width, height);

    // 2. Characters on the Stage
    this.buildBandCharacters(width, height);

    // 3. Rhythm Visualizer Container (Highway, Pulse, or Pictogram)
    this.rhythmContainer = this.add.container(width / 2, 235);
    this.buildRhythmVisualizer();

    // 4. Interactive Instrument Pads Area
    this.buildInstrumentPads(width, height);

    // 5. Header HUD
    this.buildHeaderHUD(width);

    // 6. Mode-specific Turn Announcement Banner
    this.buildTurnBanner(width);

    // 7. Input Keyboard Bindings
    this.setupKeyboardInput();

    // 8. Start Transport & Audio Scheduler
    transport.bpm = this.stageDef.defaultBpm;
    transport.onBeat((beat, bar, beatInBar) => this.onBeat(beat, bar, beatInBar));
    audioScheduler.start();
    transport.start();

    // Hook up mode initial state
    this.initCurrentMode();
  }

  // ==========================================
  // STAGE & VISUAL SETUP
  // ==========================================

  private buildStageBackground(width: number, height: number): void {
    // Sky
    const skyHex = parseInt(this.stageDef.skyColorTop.replace('#', '0x'), 16);
    this.add.rectangle(width / 2, height / 2, width, height, skyHex);

    // Stage Floor
    const floorHex = parseInt(this.stageDef.floorColor.replace('#', '0x'), 16);
    const floorH = 260;
    const floor = this.add.rectangle(width / 2, height - floorH / 2, width, floorH, floorHex);
    floor.setStrokeStyle(3, 0xfff8e8);

    // Stage Footlights
    for (let x = 30; x < width; x += 60) {
      const lamp = this.add.circle(x, height - floorH + 6, 8, 0xf3c24f, 0.7);
      this.tweens.add({
        targets: lamp,
        alpha: 0.35,
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(400, 900),
      });
    }

    // Stage Curtains / Proscenium
    const curtainCol = parseInt(this.stageDef.themeColor.replace('#', '0x'), 16);
    this.add.rectangle(25, height / 2, 50, height, curtainCol);
    this.add.rectangle(width - 25, height / 2, 50, height, curtainCol);
    this.add.rectangle(width / 2, 15, width, 30, curtainCol);
  }

  private buildBandCharacters(width: number, height: number): void {
    const stageY = 170;
    const charSpacing = width / 7;

    const charDefs = [
      { id: 'pipoca', name: 'Pipoca', inst: 'caixa', tex: 'char_pipoca' },
      { id: 'nino', name: 'Nino', inst: 'bumbo', tex: 'char_nino' },
      { id: 'tico', name: 'Tico (Maestro)', inst: 'palmas', tex: 'char_tico', isMaestro: true },
      { id: 'maya', name: 'Maya', inst: 'xilofone', tex: 'char_maya' },
      { id: 'lilo', name: 'Lilo', inst: 'chocalho', tex: 'char_lilo' },
      { id: 'bento', name: 'Bento', inst: 'pandeiro', tex: 'char_bento' },
    ];

    this.characters = charDefs.map((def, i) => {
      const cx = (i + 1) * charSpacing;
      const char = new BandCharacter(this, cx, stageY, {
        id: def.id,
        name: def.name,
        instrumentId: def.inst as InstrumentId,
        textureKey: def.tex,
        scale: def.isMaestro ? 1.05 : 0.95,
      });

      // Maestro mode interaction: click musician to toggle solo/mute
      char.setInteractive(new Phaser.Geom.Circle(0, 0, 45), Phaser.Geom.Circle.Contains);
      char.on('pointerdown', () => {
        if (this.currentModeId === 'maestro') {
          this.toggleMaestroInstrument(def.inst as InstrumentId, char);
        } else {
          // Play character instrument
          this.handlePlayerInstrumentHit(def.inst as InstrumentId);
        }
      });

      return char;
    });
  }

  // ==========================================
  // RHYTHM VISUALIZERS (PULSE / TRACK / PICTOGRAM)
  // ==========================================

  private buildRhythmVisualizer(): void {
    this.rhythmContainer.removeAll(true);
    const { width } = this.scale;
    const laneW = Math.min(width - 80, 800);

    // Lane Background Board
    const laneBg = this.add.rectangle(0, 0, laneW, 56, 0x1b263b, 0.75);
    laneBg.setStrokeStyle(2, 0xf3c24f);
    this.rhythmContainer.add(laneBg);

    if (this.visualMode === 'pulse') {
      // Big concentric pulse circle that beats in time
      this.pulseCircle = this.add.circle(0, 0, 24, 0xf3c24f, 0.8);
      this.rhythmContainer.add(this.pulseCircle);

      const pulseLabel = this.add.text(0, -38, 'PULSO DO COMPASSO', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        color: '#F3C24F',
      }).setOrigin(0.5);
      this.rhythmContainer.add(pulseLabel);

    } else if (this.visualMode === 'track') {
      // Rhythm Highway with Target Line in Center
      const targetLine = this.add.rectangle(0, 0, 6, 56, 0xe96a5f);
      this.rhythmContainer.add(targetLine);

      const hitRing = this.add.circle(0, 0, 20, 0xffffff, 0.2);
      hitRing.setStrokeStyle(2, 0xe96a5f);
      this.rhythmContainer.add(hitRing);

      const label = this.add.text(0, -38, 'TRILHA DE NOTAS (TOQUE NO CENTRO)', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        color: '#E96A5F',
      }).setOrigin(0.5);
      this.rhythmContainer.add(label);

    } else if (this.visualMode === 'pictogram') {
      // Pictogram rhythm cards showing pattern sequence
      const label = this.add.text(0, -38, 'PICTOGRAMA RÍTMICO', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        color: '#63A675',
      }).setOrigin(0.5);
      this.rhythmContainer.add(label);

      // 4 beat cards
      for (let i = 0; i < 4; i++) {
        const cx = -laneW / 2 + (i + 0.5) * (laneW / 4);
        const card = this.add.rectangle(cx, 0, laneW / 4 - 8, 44, 0x283b5b, 0.85);
        card.setStrokeStyle(1.5, 0xfff8e8);
        this.rhythmContainer.add(card);

        const cardText = this.add.text(cx, 0, `Tempo ${i + 1}`, {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '13px',
          color: '#FFF8E8',
        }).setOrigin(0.5);
        this.rhythmContainer.add(cardText);
      }
    }
  }

  // ==========================================
  // INSTRUMENT PADS
  // ==========================================

  private buildInstrumentPads(width: number, height: number): void {
    if (this.padsContainer) {
      this.padsContainer.destroy();
    }
    this.padsContainer = this.add.container(0, 0);

    const padY = height - 100;
    const isMobileBank = width < 768;

    // Dueto Mode: P1 on Left (4 pads), P2 on Right (4 pads)
    if (this.currentModeId === 'dueto') {
      this.buildDuetoPads(width, padY);
      return;
    }

    // Standard Modes: 4 Large Pads per Bank with Bank Switcher Tabs
    const bankSize = 4;
    const currentBankInstruments = INSTRUMENTS.slice(
      this.activeInstrumentBank * bankSize,
      (this.activeInstrumentBank + 1) * bankSize
    );

    const padW = Math.min((width - 60) / 4, 180);
    const padH = 110;
    const totalW = currentBankInstruments.length * padW + (currentBankInstruments.length - 1) * 16;
    const startX = (width - totalW) / 2 + padW / 2;

    currentBankInstruments.forEach((inst, i) => {
      const px = startX + i * (padW + 16);
      this.createPadButton(px, padY, padW, padH, inst);
    });

    // Bank Switcher Tabs (3 banks of 4 = 12 instruments)
    this.createBankSwitcher(width, height - 28);
  }

  private createPadButton(
    x: number,
    y: number,
    w: number,
    h: number,
    inst: InstrumentDef,
    labelSuffix?: string
  ): Phaser.GameObjects.Container {
    const pad = this.add.container(x, y);

    // Shadow
    const shadow = this.add.rectangle(3, 4, w, h, 0x000000, 0.3);
    pad.add(shadow);

    // Button body
    const colNum = parseInt(inst.color.replace('#', '0x'), 16);
    const body = this.add.rectangle(0, 0, w, h, colNum);
    body.setStrokeStyle(3, 0xfff8e8);
    pad.add(body);

    // Instrument Icon
    const icon = this.add.text(0, -18, inst.icon, {
      fontFamily: 'sans-serif',
      fontSize: '32px',
    }).setOrigin(0.5);
    pad.add(icon);

    // Instrument Name
    const name = this.add.text(0, 18, inst.name, {
      fontFamily: 'Fredoka, Outfit, sans-serif',
      fontSize: '15px',
      color: '#FFFFFF',
      stroke: '#1B263B',
      strokeThickness: 3,
    }).setOrigin(0.5);
    pad.add(name);

    // Hotkey badge
    const keyStr = labelSuffix || `Teclado: [${inst.keyboardKey}]`;
    const keyBadge = this.add.text(0, 38, keyStr, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#FFF8E8',
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: { left: 4, right: 4, top: 1, bottom: 1 },
    }).setOrigin(0.5);
    pad.add(keyBadge);

    // Interaction
    body.setInteractive({ useHandCursor: true });

    body.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePlayerInstrumentHit(inst.id, pointer.x, pointer.y);
      // Squash animation
      pad.setScale(0.92);
      this.tweens.add({
        targets: pad,
        scale: 1.0,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    this.padsContainer.add(pad);
    return pad;
  }

  private buildDuetoPads(width: number, padY: number): void {
    const padW = Math.min((width / 2 - 40) / 4, 110);
    const padH = 100;

    // Player 1 (Left: A, S, D, F)
    const p1Instruments = INSTRUMENTS.filter((i) => i.duetP1Key);
    const p1StartX = 30 + padW / 2;
    p1Instruments.forEach((inst, i) => {
      const px = p1StartX + i * (padW + 8);
      this.createPadButton(px, padY, padW, padH, inst, `P1: [${inst.duetP1Key}]`);
    });

    // Player 2 (Right: H, J, K, L)
    const p2Instruments = INSTRUMENTS.filter((i) => i.duetP2Key);
    const p2StartX = width / 2 + 30 + padW / 2;
    p2Instruments.forEach((inst, i) => {
      const px = p2StartX + i * (padW + 8);
      this.createPadButton(px, padY, padW, padH, inst, `P2: [${inst.duetP2Key}]`);
    });

    // Center divider label
    const divider = this.add.text(width / 2, padY, '🤝 DUETO', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#F3C24F',
      stroke: '#1B263B',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.padsContainer.add(divider);
  }

  private createBankSwitcher(width: number, y: number): void {
    const banks = [
      { id: 0, label: 'Banco 1 (Percussão Base)' },
      { id: 1, label: 'Banco 2 (Metais & Melódicos)' },
      { id: 2, label: 'Banco 3 (Bateria & Teclado)' },
    ];

    const tabW = 160;
    const startX = (width - banks.length * (tabW + 10)) / 2 + tabW / 2;

    banks.forEach((b, i) => {
      const bx = startX + i * (tabW + 10);
      const isSelected = this.activeInstrumentBank === b.id;

      const tab = this.add.container(bx, y);
      const bg = this.add.rectangle(0, 0, tabW, 26, isSelected ? 0xf3c24f : 0x1b263b, 0.9);
      bg.setStrokeStyle(1.5, 0xfff8e8);
      tab.add(bg);

      const txt = this.add.text(0, 0, b.label, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '11px',
        color: isSelected ? '#283B5B' : '#FFF8E8',
      }).setOrigin(0.5);
      tab.add(txt);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        soundSynth.playUIPop();
        this.activeInstrumentBank = b.id;
        const { width: w, height: h } = this.scale;
        this.buildInstrumentPads(w, h);
      });

      this.padsContainer.add(tab);
    });
  }

  // ==========================================
  // HEADER HUD
  // ==========================================

  private buildHeaderHUD(width: number): void {
    const headerBg = this.add.rectangle(width / 2, 22, width, 44, 0x1b263b, 0.9);
    headerBg.setStrokeStyle(1.5, 0xf3c24f);

    // Back to Menu Button
    const backBtn = this.add.text(20, 22, '◀ MENU', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      color: '#F3C24F',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      soundSynth.playUIPop();
      transport.pause();
      this.scene.start('MainMenuScene');
    });

    // Stage & Mode Title
    const modeName = this.getModeDisplayName(this.currentModeId);
    this.add.text(width / 2, 14, `${this.stageDef.name} — ${modeName}`, {
      fontFamily: 'Fredoka, Outfit, sans-serif',
      fontSize: '16px',
      color: '#FFF8E8',
    }).setOrigin(0.5);

    // Combo & Layer Info
    this.comboText = this.add.text(width / 2 - 120, 30, 'Combo: 0', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#F3C24F',
    }).setOrigin(0.5);

    this.comboLayerText = this.add.text(width / 2 + 100, 30, 'Camada: Ritmo Inicial', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#95D5B2',
    }).setOrigin(0.5);

    // BPM Controls
    const bpmBox = this.add.container(width - 240, 22);
    const minusBtn = this.add.text(-40, 0, '➖', { fontSize: '12px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.bpmText = this.add.text(0, 0, `${transport.bpm} BPM`, { fontFamily: 'Fredoka', fontSize: '13px', color: '#FFF8E8' }).setOrigin(0.5);
    const plusBtn = this.add.text(40, 0, '➕', { fontSize: '12px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    minusBtn.on('pointerdown', () => {
      transport.bpm -= 5;
      this.bpmText.setText(`${transport.bpm} BPM`);
    });
    plusBtn.on('pointerdown', () => {
      transport.bpm += 5;
      this.bpmText.setText(`${transport.bpm} BPM`);
    });
    bpmBox.add([minusBtn, this.bpmText, plusBtn]);

    // Visual Mode Toggle Button (Pulso / Trilha / Pictograma)
    const viewBtn = this.add.text(width - 145, 22, `👁️ ${this.visualMode.toUpperCase()}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      color: '#63A675',
      backgroundColor: '#283B5B',
      padding: { left: 6, right: 6, top: 4, bottom: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    viewBtn.on('pointerdown', () => {
      soundSynth.playUIPop();
      if (this.visualMode === 'pulse') this.visualMode = 'track';
      else if (this.visualMode === 'track') this.visualMode = 'pictogram';
      else this.visualMode = 'pulse';
      viewBtn.setText(`👁️ ${this.visualMode.toUpperCase()}`);
      storageManager.saveSettings({ visualMode: this.visualMode });
      this.buildRhythmVisualizer();
    });

    // Play / Pause Button
    const playPauseBtn = this.add.container(width - 55, 22);
    const btnBg = this.add.rectangle(0, 0, 65, 28, 0x283b5b);
    btnBg.setStrokeStyle(1.5, 0xf3c24f);
    this.playPauseBtnText = this.add.text(0, 0, '⏸ PAUSAR', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      color: '#FFF8E8',
    }).setOrigin(0.5);
    playPauseBtn.add([btnBg, this.playPauseBtnText]);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerdown', () => {
      soundSynth.playUIPop();
      transport.toggle();
      this.playPauseBtnText.setText(transport.isPlaying ? '⏸ PAUSAR' : '▶ TOCAR');
    });
  }

  private buildTurnBanner(width: number): void {
    this.turnIndicatorBar = this.add.rectangle(width / 2, 70, width - 40, 26, 0x63a675, 0.85);
    this.turnIndicatorBar.setStrokeStyle(1.5, 0xfff8e8);

    this.turnText = this.add.text(width / 2, 70, '🎉 Bem-vindo ao palco da Banda do Tico!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#FFF8E8',
    }).setOrigin(0.5);
  }

  private setTurnMessage(msg: string, colorHex = 0x63a675): void {
    this.turnText.setText(msg);
    this.turnIndicatorBar.setFillStyle(colorHex, 0.85);
  }

  // ==========================================
  // GAMEPLAY & AUDIO SCHEDULING
  // ==========================================

  private initCurrentMode(): void {
    if (this.currentModeId === 'brinca_som') {
      this.setTurnMessage('🥁 Brinca Som: Toque livremente em qualquer instrumento!');
    } else if (this.currentModeId === 'faz_igual') {
      this.turnState = 'listen';
      this.setTurnMessage('🦜 Ouça o Tico tocar a frase...', 0xe96a5f);
      this.queueFazIgualPhrase();
    } else if (this.currentModeId === 'eco_musical') {
      this.turnState = 'listen';
      this.setTurnMessage('👂 Ouça com atenção! Depois repita de memória...', 0x8a79c7);
      this.queueEcoPhrase();
    } else if (this.currentModeId === 'complete_compasso') {
      this.setTurnMessage('⏱️ Complete o Compasso: Toque o instrumento no 4º tempo!', 0xf3c24f);
    } else if (this.currentModeId === 'crie_seu_beat') {
      this.setTurnMessage('🎛️ Crie Seu Beat: Use o sequenciador para criar sua música!');
      window.dispatchEvent(new CustomEvent('open-sequencer'));
    } else if (this.currentModeId === 'banda_junto') {
      this.setTurnMessage('🥁 Banda Junto: Mantenha o ritmo para liberar novas camadas sonoras!', 0xf4a261);
      this.queueBandaJuntoTrack();
    } else if (this.currentModeId === 'dueto') {
      this.setTurnMessage('🤝 Dueto Cooperativo: Jogador 1 (esquerda) e Jogador 2 (direita)!', 0x06d6a0);
    } else if (this.currentModeId === 'maestro') {
      this.setTurnMessage('🪄 Modo Maestro: Clique nos músicos para ligar ou desligar instrumentos!', 0xb5838d);
    }
  }

  private queueFazIgualPhrase(): void {
    this.callNotesPlayed = ['tambor', 'chocalho', 'tambor', 'palmas'];
    this.playerResponseNotes = [];

    const startBeat = Math.ceil(transport.currentBeat) + 2;
    const events: NoteEvent[] = this.callNotesPlayed.map((inst, i) => ({
      beat: startBeat + i,
      instrumentId: inst,
      velocity: 0.9,
    }));

    audioScheduler.queueNotes(events);

    // Switch to player turn after call finishes
    const finishTime = (startBeat + this.callNotesPlayed.length) * transport.secondsPerBeat;
    const delayMs = Math.max(100, (finishTime - transport.currentBeat * transport.secondsPerBeat) * 1000);

    this.time.delayedCall(delayMs, () => {
      this.turnState = 'play';
      this.setTurnMessage('👉 SUA VEZ! Repita a sequência do Tico!', 0x63a675);
      soundSynth.playUIStar();
    });
  }

  private queueEcoPhrase(): void {
    this.callNotesPlayed = ['bumbo', 'pandeiro', 'triangulo', 'prato'];
    this.playerResponseNotes = [];

    const startBeat = Math.ceil(transport.currentBeat) + 2;
    const events: NoteEvent[] = this.callNotesPlayed.map((inst, i) => ({
      beat: startBeat + i,
      instrumentId: inst,
      velocity: 0.9,
    }));

    audioScheduler.queueNotes(events);

    const finishTime = (startBeat + this.callNotesPlayed.length) * transport.secondsPerBeat;
    const delayMs = Math.max(100, (finishTime - transport.currentBeat * transport.secondsPerBeat) * 1000);

    this.time.delayedCall(delayMs, () => {
      this.turnState = 'play';
      this.setTurnMessage('🧠 SUA VEZ: Toque os instrumentos de memória!', 0x8a79c7);
      soundSynth.playUIStar();
    });
  }

  private queueBandaJuntoTrack(): void {
    // Loop current pattern continuously
    audioScheduler.clearQueue();
    const pattern = this.currentPattern;
    const startBeat = Math.ceil(transport.currentBeat) + 1;
    const events: NoteEvent[] = [];

    // Schedule 8 bars of pattern
    for (let bar = 0; bar < 8; bar++) {
      pattern.steps.forEach((step) => {
        events.push({
          beat: startBeat + bar * pattern.lengthBeats + step.beat,
          instrumentId: step.instrumentId,
          velocity: step.velocity ?? 0.85,
          noteIndex: step.noteIndex,
        });
      });
    }

    audioScheduler.queueNotes(events);
  }

  // ==========================================
  // BEAT LISTENER & HIGHWAY UPDATE
  // ==========================================

  private onBeat(beat: number, bar: number, beatInBar: number): void {
    // 1. Animate all band characters
    this.characters.forEach((char) => {
      // In maestro mode, only active instruments groove intensely
      if (this.currentModeId === 'maestro' && !this.maestroActiveInstruments.has(char.instrumentId)) {
        return;
      }
      char.onBeat(beatInBar);
    });

    // 2. Animate Rhythm Visualizer
    if (this.visualMode === 'pulse' && this.pulseCircle) {
      this.pulseCircle.setScale(1.6);
      this.pulseCircle.setAlpha(1.0);
      this.tweens.add({
        targets: this.pulseCircle,
        scale: 0.8,
        alpha: 0.35,
        duration: 220,
        ease: 'Quad.easeOut',
      });
    }

    // 3. Complete o Compasso Mode
    if (this.currentModeId === 'complete_compasso' && beatInBar === 2) {
      this.setTurnMessage('⭐ ATENÇÃO! Toque no próximo tempo (4º tempo)!', 0xf3c24f);
      soundSynth.playMetronomeTick(false);
    }

    // 4. Update Sequencer if active
    if (this.currentModeId === 'crie_seu_beat') {
      beatSequencer.update(transport.beatToAudioTime(beat));
    }
  }

  // ==========================================
  // PLAYER HIT HANDLING
  // ==========================================

  public handlePlayerInstrumentHit(id: InstrumentId, touchX?: number, touchY?: number): void {
    const ctx = soundSynth as unknown; // context access handled in synth
    const nowAudio = transport.beatToAudioTime(transport.currentBeat);

    // 1. Play sound immediately (< 1 frame latency)
    soundSynth.playInstrument(id, { velocity: 1.0 });

    // 2. Animate matching Character
    const matchedChar = this.characters.find((c) => c.instrumentId === id);
    if (matchedChar) {
      matchedChar.triggerHit();
    }

    // 3. Visual Juice
    const tx = touchX ?? this.scale.width / 2;
    const ty = touchY ?? this.scale.height - 100;
    const instDef = INSTRUMENT_MAP.get(id);
    const colorHex = parseInt((instDef?.color || '#F3C24F').replace('#', '0x'), 16);

    this.juice.spawnRipple(tx, ty, colorHex);
    this.juice.spawnFloatingNote(tx, ty, '♪', instDef?.color || '#FFF8E8');

    // 4. Rhythm Judgment & Scoring
    const targetBeat = Math.round(transport.currentBeat);
    const expectedTime = transport.beatToAudioTime(targetBeat);
    const result: RhythmAttempt = rhythmJudge.evaluateTap(
      expectedTime,
      nowAudio,
      targetBeat,
      id,
      this.currentModeId
    );

    // Update Combo HUD
    this.comboText.setText(`Combo: ${result.comboAfter}`);
    this.comboLayerText.setText(`Camada: ${rhythmJudge.getComboMilestone(result.comboAfter)}`);

    if (result.judgement === 'perfect' || result.judgement === 'good') {
      this.juice.spawnStarBurst(tx, ty, result.judgement === 'perfect' ? 8 : 4, colorHex);
      if (result.comboAfter > 0 && result.comboAfter % 4 === 0) {
        this.juice.triggerConfetti();
        if (matchedChar) matchedChar.celebrate();
      }
    }

    // Mode-specific Logic (Faz Igual / Eco Musical)
    if (this.currentModeId === 'faz_igual' || this.currentModeId === 'eco_musical') {
      if (this.turnState === 'play') {
        this.playerResponseNotes.push(id);
        const expectedInst = this.callNotesPlayed[this.playerResponseNotes.length - 1];

        if (id === expectedInst) {
          soundSynth.playUIPop();
        }

        if (this.playerResponseNotes.length >= this.callNotesPlayed.length) {
          this.finishTurnRound();
        }
      }
    }
  }

  private finishTurnRound(): void {
    this.turnState = 'listen';
    this.juice.triggerConfetti();
    this.setTurnMessage('🌟 Sensacional! Você acertou toda a frase!', 0x63a675);
    soundSynth.playUIStar();
    this.characters.forEach((c) => c.celebrate());

    this.time.delayedCall(2200, () => {
      if (this.currentModeId === 'faz_igual') {
        this.queueFazIgualPhrase();
      } else {
        this.queueEcoPhrase();
      }
    });
  }

  private toggleMaestroInstrument(id: InstrumentId, char: BandCharacter): void {
    soundSynth.playUIPop();
    if (this.maestroActiveInstruments.has(id)) {
      this.maestroActiveInstruments.delete(id);
      char.setAlpha(0.4);
      this.setTurnMessage(`🪄 Maestro: ${char.characterName} descansando.`);
    } else {
      this.maestroActiveInstruments.add(id);
      char.setAlpha(1.0);
      char.celebrate();
      this.setTurnMessage(`🪄 Maestro: ${char.characterName} entrou no concerto!`, 0x63a675);
    }
  }

  // ==========================================
  // KEYBOARD CONTROLS
  // ==========================================

  private setupKeyboardInput(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      // Dueto Mode mappings
      if (this.currentModeId === 'dueto') {
        const p1Match = INSTRUMENTS.find((i) => i.duetP1Key === key);
        if (p1Match) {
          this.handlePlayerInstrumentHit(p1Match.id);
          return;
        }
        const p2Match = INSTRUMENTS.find((i) => i.duetP2Key === key);
        if (p2Match) {
          this.handlePlayerInstrumentHit(p2Match.id);
          return;
        }
      }

      // Standard Number / Key mappings
      const match = INSTRUMENTS.find((i) => i.keyboardKey.toUpperCase() === key);
      if (match) {
        this.handlePlayerInstrumentHit(match.id);
      }
    });
  }

  public update(time: number, delta: number): void {
    const dt = delta / 1000;
    this.juice.update(dt);
  }

  private getModeDisplayName(modeId: string): string {
    const map: Record<string, string> = {
      brinca_som: 'Brinca Som (Sandbox)',
      faz_igual: 'Faz Igual (Imitação)',
      eco_musical: 'Eco Musical (Memória)',
      complete_compasso: 'Complete o Compasso',
      crie_seu_beat: 'Crie Seu Beat (Sequenciador)',
      banda_junto: 'Banda Junto (Ao Vivo)',
      dueto: 'Dueto (2 Jogadores)',
      maestro: 'Maestro (Regência)',
    };
    return map[modeId] || modeId;
  }
}
