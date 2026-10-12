import React, { useRef, useEffect } from 'react';
import type { BubbleEngine } from '../utils/physics';
import { soundManager } from '../utils/sound';

interface BubblesCanvasProps {
  engine: BubbleEngine;
  onChildPop?: () => void;
}

export const BubblesCanvas: React.FC<BubblesCanvasProps> = ({ engine, onChildPop }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Update physics
      engine.update(dt, width, height);

      // Clear & Draw Riverside Horizon Background
      ctx.clearRect(0, 0, width, height);

      // Sky gradient (warm late afternoon over Amazonian waters)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#bae6fd'); // soft azure
      skyGrad.addColorStop(0.5, '#e0f2fe');
      skyGrad.addColorStop(0.85, '#fed7aa'); // peach twilight
      skyGrad.addColorStop(1, '#fde68a'); // gold riverside glow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Gentle river water reflection at bottom
      const waterGrad = ctx.createLinearGradient(0, height - 70, 0, height);
      waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      waterGrad.addColorStop(1, 'rgba(14, 165, 233, 0.45)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, height - 70, width, 70);

      // Draw Physical Bubble Bottle (adult's anchor - not clickable by child)
      const bottleX = width / 2;
      const bottleY = height - 60;
      ctx.save();
      ctx.translate(bottleX, bottleY);

      // Bottle Shadow
      ctx.beginPath();
      ctx.ellipse(0, 45, 36, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fill();

      // Bottle Body
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-24, 0, 48, 45, [6, 6, 12, 12]);
      ctx.fill();

      // Bottle Cap / Neck
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-12, -14, 24, 14);

      // Wand Ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -26, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Bottle Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Atkinson Hyperlegible, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🫧 BOLHAS', 0, 26);
      ctx.restore();

      // Draw Pop Particles
      for (const pt of engine.particles) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.color.replace('0.8)', `${pt.alpha})`);
        ctx.fill();
      }

      // Draw Bubbles
      for (const b of engine.bubbles) {
        ctx.save();
        ctx.translate(b.x, b.y);

        // Giant bubble deformation
        let scaleX = 1;
        let scaleY = 1;
        if (b.isSpecial === 'gigante') {
          scaleX = 1 + Math.sin(b.wobblePhase) * 0.04;
          scaleY = 1 - Math.sin(b.wobblePhase) * 0.04;
          ctx.scale(scaleX, scaleY);
        }

        // Outer iridescent gradient
        const rad = b.radius;
        const grad = ctx.createRadialGradient(-rad * 0.3, -rad * 0.35, rad * 0.1, 0, 0, rad);
        grad.addColorStop(0, `hsla(${b.colorHue}, 100%, 95%, 0.95)`);
        grad.addColorStop(0.4, `hsla(${b.colorHue}, 80%, 75%, 0.45)`);
        grad.addColorStop(0.85, `hsla(${(b.colorHue + 60) % 360}, 90%, 70%, 0.35)`);
        grad.addColorStop(1, `hsla(${(b.colorHue + 120) % 360}, 95%, 65%, 0.65)`);

        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Iridescent outer stroke
        ctx.strokeStyle = `hsla(${b.colorHue}, 80%, 85%, 0.75)`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Primary specular highlight (curved shine reflection)
        ctx.beginPath();
        ctx.ellipse(-rad * 0.38, -rad * 0.38, rad * 0.22, rad * 0.1, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // Secondary bottom rim shine
        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.85, Math.PI * 0.25, Math.PI * 0.65);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Special icon for Amazonian Fish Bubble
        if (b.isSpecial === 'peixe') {
          ctx.font = `${rad * 0.65}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐠', 0, 0);
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
  }, [engine]);

  // INVIOLABLE RULE: Child pointer interaction ONLY pops existing bubbles.
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const result = engine.handleChildTouch(x, y);
    if (result.popped) {
      soundManager.playPop(Math.floor(Math.random() * 5));
      onChildPop?.();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="denver-bubbles-canvas"
      onPointerDown={handlePointerDown}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        cursor: 'pointer',
      }}
    />
  );
};
