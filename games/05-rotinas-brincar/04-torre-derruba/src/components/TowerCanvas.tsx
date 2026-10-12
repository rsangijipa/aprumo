import React, { useRef, useEffect } from 'react';
import type { TowerPhysicsEngine } from '../utils/towerPhysics';
import type { TurnHolder } from '../types/tower';

interface TowerCanvasProps {
  engine: TowerPhysicsEngine;
  turnHolder: TurnHolder;
  canKnockdown: boolean;
  onBlockPlaced: (height: number) => void;
  onTowerKnocked: () => void;
}

export const TowerCanvas: React.FC<TowerCanvasProps> = ({
  engine,
  turnHolder,
  canKnockdown,
  onBlockPlaced,
  onTowerKnocked,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ blockId: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      engine.resize(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Update Matter physics
      engine.update(dt);

      // Clear & Draw Playroom Backdrop
      ctx.clearRect(0, 0, width, height);

      // Playroom warm wall background
      const wallGrad = ctx.createLinearGradient(0, 0, 0, height);
      wallGrad.addColorStop(0, '#fef3c7'); // warm sunlit cream
      wallGrad.addColorStop(0.7, '#fef9c3');
      wallGrad.addColorStop(1, '#fde68a');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, width, height);

      // Target Tower Building Zone Indicator in Center
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(width / 2 - 90, 80, 180, height - 130);
      ctx.fillStyle = 'rgba(2, 132, 199, 0.04)';
      ctx.fillRect(width / 2 - 90, 80, 180, height - 130);
      ctx.restore();

      // Vitória-Régia Rubber Playmat Floor at bottom
      const matHeight = 50;
      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.roundRect(width * 0.025, height - matHeight, width * 0.95, matHeight, [14, 14, 0, 0]);
      ctx.fill();

      // Playmat subtle pattern
      ctx.fillStyle = '#1b4332';
      for (let x = width * 0.04; x < width * 0.94; x += 40) {
        ctx.beginPath();
        ctx.arc(x, height - matHeight / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Side Banners: Adult Zone (Left) & Child Zone (Right)
      const adultActive = turnHolder === 'ADULTO' || turnHolder === 'LIVRE';
      const childActive = turnHolder === 'CRIANCA' || turnHolder === 'LIVRE';

      // Adult Zone (Left)
      ctx.fillStyle = adultActive ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.06)';
      ctx.fillRect(16, 80, 190, height - 150);
      ctx.strokeStyle = adultActive ? '#3b82f6' : '#cbd5e1';
      ctx.lineWidth = adultActive ? 3 : 1;
      ctx.strokeRect(16, 80, 190, height - 150);

      ctx.fillStyle = adultActive ? '#1e3a8a' : '#64748b';
      ctx.font = 'bold 14px Atkinson Hyperlegible, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LADO DO ADULTO', 111, 106);

      // Child Zone (Right)
      ctx.fillStyle = childActive ? 'rgba(16, 185, 129, 0.14)' : 'rgba(100, 116, 139, 0.06)';
      ctx.fillRect(width - 206, 80, 190, height - 150);
      ctx.strokeStyle = childActive ? '#10b981' : '#cbd5e1';
      ctx.lineWidth = childActive ? 3 : 1;
      ctx.strokeRect(width - 206, 80, 190, height - 150);

      ctx.fillStyle = childActive ? '#065f46' : '#64748b';
      ctx.fillText('LADO DA CRIANÇA', width - 111, 106);

      // Draw Knockdown Unlock Banner if Adult has released knockdown!
      if (canKnockdown) {
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 130, 25, 260, 42, [12, 12, 12, 12]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💥 TOQUE NA TORRE P/ DERRUBAR!', width / 2, 52);
        ctx.restore();
      }

      // Draw All Blocks
      for (const b of engine.blocks) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        // Turn Dimming: blocks on inactive side have 55% opacity and un-draggable
        const isOwnerTurn =
          turnHolder === 'LIVRE' ||
          (turnHolder === 'ADULTO' && b.owner === 'adulto') ||
          (turnHolder === 'CRIANCA' && b.owner === 'crianca');

        if (!b.placedInTower && !isOwnerTurn) {
          ctx.globalAlpha = 0.5;
        }

        // Drop Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = b.placedInTower ? 4 : 8;
        ctx.shadowOffsetY = b.placedInTower ? 2 : 4;

        // Block Body with Paper-cutout Wood Texture styling
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(-b.width / 2, -b.height / 2, b.width, b.height, [8, 8, 8, 8]);
        ctx.fill();

        // Subtle wooden grain lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-b.width * 0.4, -b.height * 0.2);
        ctx.lineTo(b.width * 0.4, -b.height * 0.2);
        ctx.moveTo(-b.width * 0.3, b.height * 0.2);
        ctx.lineTo(b.width * 0.35, b.height * 0.2);
        ctx.stroke();

        // Border highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Owner mini-badge if not placed in tower
        if (!b.placedInTower) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.font = 'bold 11px Atkinson Hyperlegible, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(b.owner === 'adulto' ? 'ADULTO' : 'CRIANÇA', 0, 4);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [engine, turnHolder, canKnockdown]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. If canKnockdown is active and child touches the tower, KNOCK DOWN!
    if (canKnockdown) {
      const centerX = rect.width / 2;
      if (Math.abs(x - centerX) < 160) {
        const knocked = engine.knockdownTower();
        if (knocked) {
          onTowerKnocked();
          return;
        }
      }
    }

    // 2. Pick block to drag (only allowed if it matches active turn)
    for (let i = engine.blocks.length - 1; i >= 0; i--) {
      const b = engine.blocks[i];
      if (b.placedInTower) continue; // Once in tower, can't be dragged away

      // Enforce turn restriction
      const isAllowed =
        turnHolder === 'LIVRE' ||
        (turnHolder === 'ADULTO' && b.owner === 'adulto') ||
        (turnHolder === 'CRIANCA' && b.owner === 'crianca');

      if (!isAllowed) continue;

      const inside =
        x >= b.x - b.width / 2 &&
        x <= b.x + b.width / 2 &&
        y >= b.y - b.height / 2 &&
        y <= b.y + b.height / 2;

      if (inside) {
        dragRef.current = {
          blockId: b.id,
          offsetX: x - b.x,
          offsetY: y - b.y,
        };
        engine.startDrag(b.id);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragRef.current.offsetX;
    const y = e.clientY - rect.top - dragRef.current.offsetY;

    engine.updateDrag(dragRef.current.blockId, x, y);
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const blockId = dragRef.current.blockId;
    dragRef.current = null;

    const result = engine.endDrag(blockId, rect.width, rect.height);
    if (result.placed) {
      onBlockPlaced(result.towerHeight);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="tower-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
};
