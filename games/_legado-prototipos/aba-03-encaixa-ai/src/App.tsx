import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  PuzzleTheme,
  PuzzlePieceDef,
  PlacedPieceState,
  ChainType,
  PromptLevel,
  AbaTrial,
  Point,
} from './types/puzzle';
import {
  BUILT_IN_THEMES,
  LEVEL_CONFIGS,
  parseSvgToTheme,
} from './utils/puzzleFromSvg';
import {
  createChainState,
  setupChainedPieces,
  evaluateChainCompletion,
  evaluateChainFailure,
  type ChainState,
} from './utils/chain';
import { evaluateSnap } from './utils/snapMath';
import { sound } from './utils/sound';

import { PuzzleBoard } from './components/PuzzleBoard';
import { PieceTray } from './components/PieceTray';
import { PuzzlePiece } from './components/PuzzlePiece';
import { ClinicalPanel } from './components/ClinicalPanel';
import { PhysicalBridgeModal } from './components/PhysicalBridgeModal';
import { CelebrationOverlay } from './components/CelebrationOverlay';

import { Volume2, VolumeX, Eye, BookOpen, Layers, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  // Level & Theme State
  const [currentLevel, setCurrentLevel] = useState<number>(3);
  const [themes, setThemes] = useState<PuzzleTheme[]>(BUILT_IN_THEMES);
  const [activeThemeId, setActiveThemeId] = useState<string>('amazonia-animais');

  const currentTheme = themes.find((t) => t.id === activeThemeId) || themes[0];
  const levelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];

  // Chaining State (chain.ts)
  const [chainState, setChainState] = useState<ChainState>(() =>
    createChainState(currentTheme.pieces.length, 'reverso', 1)
  );

  // Board pieces and Tray pieces derived from chaining setup
  const [placedPieces, setPlacedPieces] = useState<PlacedPieceState[]>([]);
  const [trayPieceIds, setTrayPieceIds] = useState<string[]>([]);

  // Selected piece & Rotation state (degrees per piece)
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [pieceAngles, setPieceAngles] = useState<Record<string, number>>({});
  const [attemptsMap, setAttemptsMap] = useState<Record<string, number>>({});
  const [rotationsMap, setRotationsMap] = useState<Record<string, number>>({});

  // Active Prompts & Accessibility
  const [activePrompt, setActivePrompt] = useState<PromptLevel>('NONE');
  const [isLeftHanded, setIsLeftHanded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'child' | 'therapist'>('child');
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Trials telemetry
  const [trials, setTrials] = useState<AbaTrial[]>([]);
  const trialStartTimeRef = useRef<number>(Date.now());

  // Dragging state
  const [draggingPiece, setDraggingPiece] = useState<PuzzlePieceDef | null>(null);
  const [dragPosition, setDragPosition] = useState<Point>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Reset or setup board when theme or chain state changes
  const initBoard = useCallback(() => {
    const setup = setupChainedPieces(currentTheme.pieces, chainState);
    setPlacedPieces(setup.boardPieces);
    setTrayPieceIds(setup.trayPieceIds);
    setSelectedPieceId(setup.trayPieceIds[0] || null);

    // Initial random or 0 angles
    const initialAngles: Record<string, number> = {};
    const initialAttempts: Record<string, number> = {};
    const initialRotations: Record<string, number> = {};

    currentTheme.pieces.forEach((p) => {
      initialAngles[p.id] = levelConfig.allowRotation
        ? [0, 90, 180, 270][Math.floor(Math.random() * 4)]
        : 0;
      initialAttempts[p.id] = 0;
      initialRotations[p.id] = 0;
    });

    setPieceAngles(initialAngles);
    setAttemptsMap(initialAttempts);
    setRotationsMap(initialRotations);
    setShowCelebration(false);
    trialStartTimeRef.current = Date.now();
  }, [currentTheme, chainState, levelConfig.allowRotation]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Handle Level Change
  const handleSelectLevel = (lvl: number) => {
    setCurrentLevel(lvl);
    const cfg = LEVEL_CONFIGS[lvl];
    if (cfg) {
      setActiveThemeId(cfg.defaultThemeId);
      const th = themes.find((t) => t.id === cfg.defaultThemeId) || themes[0];
      setChainState(createChainState(th.pieces.length, chainState.chainType, 1));
    }
  };

  // Handle Theme Change
  const handleSelectTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    const th = themes.find((t) => t.id === themeId) || themes[0];
    setChainState(createChainState(th.pieces.length, chainState.chainType, 1));
  };

  // Rotate a piece by 90 degrees
  const handleRotatePiece = (pieceId: string) => {
    sound.playRotate();
    setPieceAngles((prev) => ({
      ...prev,
      [pieceId]: ((prev[pieceId] || 0) + 90) % 360,
    }));
    setRotationsMap((prev) => ({
      ...prev,
      [pieceId]: (prev[pieceId] || 0) + 1,
    }));
  };

  // Target piece for prompts (first remaining tray piece)
  const targetPieceId = trayPieceIds[0] || null;

  // Process Snap Evaluation
  const processPiecePlacement = (
    piece: PuzzlePieceDef,
    boardCoords: Point,
    isDirectTap: boolean = false
  ) => {
    const currentAngle = pieceAngles[piece.id] || 0;
    const attempts = (attemptsMap[piece.id] || 0) + 1;
    setAttemptsMap((prev) => ({ ...prev, [piece.id]: attempts }));

    // 1. Evaluate against target cavity
    const targetCavityPos: Point = { x: piece.targetX, y: piece.targetY };
    const targetEval = evaluateSnap(
      boardCoords,
      targetCavityPos,
      currentAngle,
      piece.targetAngle,
      levelConfig.captureRadiusPx,
      levelConfig.angleToleranceDeg,
      levelConfig.allowRotation
    );

    // If direct tap on correct cavity was triggered
    if (isDirectTap || targetEval.canSnap) {
      // SUCCESS SNAP!
      sound.playWoodToc();

      const newPlacedPiece: PlacedPieceState = {
        pieceId: piece.id,
        isPlaced: true,
        placedBy: 'child',
        currentX: piece.targetX,
        currentY: piece.targetY,
        currentAngle: piece.targetAngle,
        attempts,
        rotationsUsed: rotationsMap[piece.id] || 0,
      };

      setPlacedPieces((prev) => [...prev, newPlacedPiece]);
      const remainingTray = trayPieceIds.filter((id) => id !== piece.id);
      setTrayPieceIds(remainingTray);
      setSelectedPieceId(remainingTray[0] || null);

      // Record successful trial
      const trial: AbaTrial = {
        trialId: `trial-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        chainType: chainState.chainType,
        chainStep: currentTheme.pieces.length - remainingTray.length,
        k: chainState.k,
        pieceId: piece.id,
        targetCavityId: piece.id,
        success: true,
        snapDistancePx: isDirectTap ? 0 : targetEval.distancePx,
        angleErrorDeg: isDirectTap ? 0 : targetEval.angleErrorDeg,
        attemptsBeforeSnap: attempts,
        rotationsUsed: rotationsMap[piece.id] || 0,
        promptUsed: activePrompt,
        timeToFitMs: Date.now() - trialStartTimeRef.current,
        isErrorTrial: false,
      };

      setTrials((prev) => [...prev, trial]);

      // Check if chain completion reached
      if (remainingTray.length === 0) {
        sound.playCelebration();
        setShowCelebration(true);

        // Evaluate chain progression
        const wasIndependent = activePrompt === 'NONE';
        const prog = evaluateChainCompletion(chainState, wasIndependent);
        setChainState(prog.nextState);
      }
      return;
    }

    // 2. Check if dropped over an INCORRECT cavity within capture radius
    // Spec 4.2 & 12: Registra resposta incorreta SÓ se estiver dentro do raio de captura de uma cavidade errada.
    const wrongCavityHit = currentTheme.pieces.find((otherPiece) => {
      if (otherPiece.id === piece.id) return false;
      const otherCavityPos: Point = { x: otherPiece.targetX, y: otherPiece.targetY };
      const evalOther = evaluateSnap(
        boardCoords,
        otherCavityPos,
        currentAngle,
        otherPiece.targetAngle,
        levelConfig.captureRadiusPx,
        levelConfig.angleToleranceDeg,
        false
      );
      return evalOther.isWithinDistance;
    });

    if (wrongCavityHit) {
      // INCORRECT CAVITY ATTEMPT
      // Spec 6.3: Sem som de erro (zero buzzers)
      const trial: AbaTrial = {
        trialId: `trial-err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        chainType: chainState.chainType,
        chainStep: currentTheme.pieces.length - trayPieceIds.length + 1,
        k: chainState.k,
        pieceId: piece.id,
        targetCavityId: wrongCavityHit.id,
        success: false,
        snapDistancePx: targetEval.distancePx,
        angleErrorDeg: targetEval.angleErrorDeg,
        attemptsBeforeSnap: attempts,
        rotationsUsed: rotationsMap[piece.id] || 0,
        promptUsed: activePrompt,
        timeToFitMs: Date.now() - trialStartTimeRef.current,
        isErrorTrial: true,
      };

      setTrials((prev) => [...prev, trial]);

      // Evaluate chaining failure criteria (regresses k after 2 consecutive failures)
      const failProg = evaluateChainFailure(chainState);
      if (failProg.kChanged) {
        setChainState(failProg.nextState);
      }
      return;
    }

    // 3. Dropped in empty space:
    // Spec 4.2 & 12: Soltar no vazio NUNCA é registrado como erro! Retorna à bandeja suavemente.
  };

  // Dragging event handlers
  const handleStartDrag = (piece: PuzzlePieceDef, e: React.PointerEvent) => {
    sound.playPickup();
    setDraggingPiece(piece);
    setSelectedPieceId(piece.id);

    setDragOffset({
      x: piece.width / 2,
      y: piece.height / 2,
    });

    setDragPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPiece) return;
    setDragPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handlePointerUp = () => {
    if (!draggingPiece) return;

    // Convert client coords to puzzle board relative coords
    const boardEl = document.getElementById('puzzle-board-container');
    if (boardEl) {
      const rect = boardEl.getBoundingClientRect();
      const boardX = dragPosition.x - rect.left;
      const boardY = dragPosition.y - rect.top;

      // Check if dropped within reasonable board bounds
      if (
        boardX >= -50 &&
        boardX <= rect.width + 50 &&
        boardY >= -50 &&
        boardY <= rect.height + 50
      ) {
        processPiecePlacement(draggingPiece, { x: boardX, y: boardY }, false);
      }
    }

    setDraggingPiece(null);
  };

  // Direct Tap on Cavity (Alternative touch accessibility)
  const handleCavityClick = (cavityPieceId: string) => {
    if (!selectedPieceId) return;
    const piece = currentTheme.pieces.find((p) => p.id === selectedPieceId);
    if (!piece) return;

    if (selectedPieceId === cavityPieceId) {
      processPiecePlacement(piece, { x: piece.targetX, y: piece.targetY }, true);
    } else {
      // Tapped wrong cavity
      const fakeCoords = {
        x: currentTheme.pieces.find((p) => p.id === cavityPieceId)?.targetX || 0,
        y: currentTheme.pieces.find((p) => p.id === cavityPieceId)?.targetY || 0,
      };
      processPiecePlacement(piece, fakeCoords, false);
    }
  };

  // Progress to next step or next puzzle
  const handleCelebrationNext = () => {
    setShowCelebration(false);
    initBoard();
  };

  // Audio Toggle
  const toggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Custom SVG Theme Importer
  const handleImportSvg = (svgStr: string, name: string) => {
    const importedTheme = parseSvgToTheme(svgStr, `custom-${Date.now()}`, name, currentLevel);
    setThemes((prev) => [...prev, importedTheme]);
    setActiveThemeId(importedTheme.id);
    setChainState(createChainState(importedTheme.pieces.length, chainState.chainType, 1));
  };

  // Remaining tray pieces
  const trayPieces = currentTheme.pieces.filter((p) => trayPieceIds.includes(p.id));

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--fundo)',
        touchAction: 'none',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '2px solid var(--tinta-15)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--vitoria-regia), var(--igarape))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(45, 106, 79, 0.3)',
            }}
          >
            <Layers size={24} />
          </div>

          <div>
            <h1
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--tinta)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ABA-03 · Encaixa Aí
              <span className="badge" style={{ backgroundColor: 'rgba(45, 106, 79, 0.12)', color: 'var(--vitoria-regia)' }}>
                Encadeamento {chainState.chainType === 'reverso' ? 'Reverso' : chainState.chainType === 'direto' ? 'Direto' : 'Total'}
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-corpo)' }}>
              Quebra-cabeça com pino de madeira · Nível {currentLevel} ({levelConfig.pieceCountDesc})
            </p>
          </div>
        </div>

        {/* Level Selector Buttons */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tinta-60)', marginRight: '2px' }}>
            Nível:
          </span>
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleSelectLevel(lvl)}
              className={`btn-tab ${currentLevel === lvl ? 'active' : ''}`}
              style={{ padding: '6px 10px', minWidth: '34px', justifyContent: 'center' }}
              title={LEVEL_CONFIGS[lvl]?.title}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Theme Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={activeThemeId}
            onChange={(e) => handleSelectTheme(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1.5px solid var(--tinta-15)',
              backgroundColor: '#FFFFFF',
              fontFamily: 'var(--font-hud)',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--tinta)',
              cursor: 'pointer',
            }}
          >
            {themes.map((th) => (
              <option key={th.id} value={th.id}>
                {th.name}
              </option>
            ))}
          </select>

          {/* Reset button */}
          <button
            onClick={initBoard}
            className="btn-tab"
            style={{ padding: '6px 10px' }}
            title="Reiniciar quebra-cabeça"
          >
            <RotateCcw size={16} />
          </button>

          {/* Audio Mute toggle */}
          <button
            onClick={toggleMute}
            className="btn-tab"
            style={{ padding: '6px 10px' }}
            title={isMuted ? 'Ativar sons' : 'Silenciar sons'}
          >
            {isMuted ? <VolumeX size={16} color="#E63946" /> : <Volume2 size={16} color="var(--vitoria-regia)" />}
          </button>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', border: '1.5px solid var(--tinta-15)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('child')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: viewMode === 'child' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: viewMode === 'child' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Eye size={14} /> Criança
            </button>
            <button
              onClick={() => setViewMode('therapist')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: viewMode === 'therapist' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: viewMode === 'therapist' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              id="btn-therapist-view"
            >
              <BookOpen size={14} /> Terapeuta
            </button>
          </div>
        </div>
      </header>

      {/* Main Play Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '24px',
          position: 'relative',
        }}
      >
        {/* Game Stage (Board + Tray) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            width: '100%',
            maxWidth: '1100px',
            flexWrap: 'wrap',
          }}
        >
          {/* Piece Tray with rotation and dominant hand switch */}
          <PieceTray
            pieces={trayPieces}
            selectedPieceId={selectedPieceId}
            activePrompt={activePrompt}
            targetPieceId={targetPieceId}
            allowRotation={levelConfig.allowRotation}
            pieceAngles={pieceAngles}
            onSelectPiece={(id) => setSelectedPieceId(id)}
            onRotatePiece={handleRotatePiece}
            onStartDrag={handleStartDrag}
            isLeftHanded={isLeftHanded}
          />

          {/* Wooden Puzzle Board with 4px cavity depth */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <PuzzleBoard
              theme={currentTheme}
              placedPieces={placedPieces}
              activePrompt={activePrompt}
              targetPieceId={targetPieceId}
              onCavityClick={handleCavityClick}
            />

            {/* Chaining Hint for Child / Assistant */}
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>
                Peças a encaixar: <strong>{trayPieces.length}</strong> · Raio de captura: <strong>{levelConfig.captureRadiusPx}px</strong>
              </span>
              {levelConfig.allowRotation && (
                <span className="badge" style={{ backgroundColor: 'rgba(244, 162, 97, 0.2)', color: 'var(--buriti)' }}>
                  Rotação 90° Ativa
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Therapist Dashboard View */}
        {viewMode === 'therapist' && (
          <ClinicalPanel
            chainType={chainState.chainType}
            k={chainState.k}
            totalPieces={currentTheme.pieces.length}
            consecutiveSuccesses={chainState.consecutiveIndependentSuccesses}
            consecutiveFailures={chainState.consecutiveFailures}
            activePrompt={activePrompt}
            isLeftHanded={isLeftHanded}
            trials={trials}
            onSetChainType={(t: ChainType) => setChainState(createChainState(currentTheme.pieces.length, t, 1))}
            onSetK={(newK: number) => setChainState((prev) => ({ ...prev, k: newK }))}
            onSetPrompt={(p: PromptLevel) => setActivePrompt(p)}
            onToggleHandedness={() => setIsLeftHanded(!isLeftHanded)}
            onOpenPhysicalBridge={() => setIsBridgeModalOpen(true)}
            onImportCustomSvg={handleImportSvg}
          />
        )}
      </main>

      {/* Floating Dragging Ghost Piece */}
      {draggingPiece && (
        <div
          style={{
            position: 'fixed',
            left: dragPosition.x - dragOffset.x,
            top: dragPosition.y - dragOffset.y,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <PuzzlePiece
            piece={draggingPiece}
            currentAngle={pieceAngles[draggingPiece.id] || 0}
            isDragging={true}
            showPeg={true}
          />
        </div>
      )}

      {/* Celebration Natural Reinforcement Overlay */}
      {showCelebration && (
        <CelebrationOverlay
          theme={currentTheme}
          k={chainState.k}
          totalPieces={currentTheme.pieces.length}
          onNext={handleCelebrationNext}
          onReplay={initBoard}
        />
      )}

      {/* Section 10 Physical Bridge Modal */}
      <PhysicalBridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        trials={trials}
        currentK={chainState.k}
        totalPieces={currentTheme.pieces.length}
      />
    </div>
  );
};

export default App;
