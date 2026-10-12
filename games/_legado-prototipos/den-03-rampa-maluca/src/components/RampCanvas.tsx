import React, { useRef, useEffect } from 'react';
import type { RampPhysicsEngine } from '../utils/rampPhysics';

interface RampCanvasProps {
  engine: RampPhysicsEngine;
}

export const RampCanvas: React.FC<RampCanvasProps> = ({ engine }) => {
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
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Update Matter physics
      engine.update(dt);

      // Clear & Draw Backdrop
      ctx.clearRect(0, 0, width, height);

      // Sky gradient (Amazonian sunny afternoon)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#bae6fd');
      skyGrad.addColorStop(0.65, '#fef3c7');
      skyGrad.addColorStop(1, '#fed7aa');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Red-dirt terrain of Rondônia at bottom
      const dirtH = 45;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, height - dirtH, width, dirtH);

      // Dirt texture specks
      ctx.fillStyle = '#78350f';
      for (let x = 10; x < width; x += 35) {
        ctx.beginPath();
        ctx.arc(x, height - dirtH + 12, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Wooden Ramp
      if (engine.rampBody) {
        ctx.save();
        ctx.translate(engine.rampBody.position.x, engine.rampBody.position.y);
        ctx.rotate(engine.rampBody.angle);

        // Ramp shadow
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        // Wood ramp plank
        ctx.fillStyle = '#ca8a04';
        const rw = width * 0.72;
        const rh = 28;
        ctx.beginPath();
        ctx.roundRect(-rw / 2, -rh / 2, rw, rh, [6, 6, 6, 6]);
        ctx.fill();

        // Planks border & grain
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.restore();
      }

      // Draw Starter Gate / Trava
      if (!engine.isGateOpen && engine.gateBody) {
        ctx.save();
        ctx.translate(engine.gateBody.position.x, engine.gateBody.position.y);
        ctx.rotate(engine.gateBody.angle);

        // Red & White warning stripes on locked gate
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(-9, -27, 18, 55, [4, 4, 4, 4]);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-9, -15);
        ctx.lineTo(9, -5);
        ctx.moveTo(-9, 5);
        ctx.lineTo(9, 15);
        ctx.stroke();

        ctx.restore();
      }

      // Draw Target Bowling Pins
      for (const pin of engine.pinBodies) {
        ctx.save();
        ctx.translate(pin.position.x, pin.position.y);
        ctx.rotate(pin.angle);

        // Pin body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-7, -27, 14, 55, [6, 6, 2, 2]);
        ctx.fill();

        // Red stripe on pin
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-7, -15, 14, 8);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      // Draw Vehicles
      for (const v of engine.vehicles) {
        const chassis = v.chassis;
        ctx.save();
        ctx.translate(chassis.position.x, chassis.position.y);
        ctx.rotate(chassis.angle);

        const w = v.type === 'onibus' ? 95 : v.type === 'caminhao' ? 85 : 70;
        const h = 32;

        // Vehicle Body
        ctx.fillStyle = v.color;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, [8, 8, 4, 4]);
        ctx.fill();

        // Roof / Cabin
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.roundRect(-w * 0.25, -h * 0.9, w * 0.5, h * 0.5, [4, 4, 0, 0]);
        ctx.fill();

        // Cute headlights
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(w / 2 - 2, 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle eyes on windshield if vehicle faces forward
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-w * 0.05, -h * 0.65, 3, 0, Math.PI * 2);
        ctx.arc(w * 0.15, -h * 0.65, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Draw Wheels
        v.composite.bodies.forEach((body) => {
          if (body !== chassis) {
            ctx.save();
            ctx.translate(body.position.x, body.position.y);
            ctx.rotate(body.angle);

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();

            // Wheel rim
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      className="ramp-canvas"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
};
