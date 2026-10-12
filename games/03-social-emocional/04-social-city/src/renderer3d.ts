/**
 * Motor de Renderização 3D Procedural para Social City
 * Projeção em perspectiva com iluminação direcional, profundidade e geometria estilizada.
 * 100% livre de dependências externas, garantindo renderização ultra-rápida e compatibilidade com React 19.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Camera3D {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  fov: number;
}

export interface Building3D {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  roofColor: string;
  wallColor: string;
  accentColor: string;
  sign: string;
}

export interface Prop3D {
  type: 'tree' | 'bench' | 'lamp' | 'bus';
  x: number;
  z: number;
  color?: string;
}

export interface Character3D {
  id: string;
  name: string;
  x: number;
  z: number;
  angle: number;
  bodyColor: string;
  hairColor: string;
  isPlayer?: boolean;
  hasQuest?: boolean;
}

export class SocialCityRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  public camera: Camera3D = {
    x: 0,
    y: 14,
    z: 16,
    targetX: 0,
    targetY: 1,
    targetZ: 0,
    fov: 420,
  };

  public buildings: Building3D[] = [
    {
      id: 'cafeteria',
      name: 'Cafeteria',
      x: -7,
      z: -5,
      w: 5,
      d: 4,
      h: 4.5,
      wallColor: '#e2e8f0',
      roofColor: '#dd6b20',
      accentColor: '#c05621',
      sign: '☕ CAFÉ',
    },
    {
      id: 'biblioteca',
      name: 'Biblioteca',
      x: 7,
      z: -4,
      w: 6,
      d: 5,
      h: 6,
      wallColor: '#cbd5e0',
      roofColor: '#2b6cb0',
      accentColor: '#1a365d',
      sign: '📚 BIBLIOTECA',
    },
    {
      id: 'estacao',
      name: 'Estação',
      x: 6,
      z: 5,
      w: 5,
      d: 3,
      h: 3.5,
      wallColor: '#e2e8f0',
      roofColor: '#319795',
      accentColor: '#285e61',
      sign: '🚌 TERMINAL',
    },
    {
      id: 'residencia',
      name: 'Residência',
      x: -8,
      z: 4,
      w: 4.5,
      d: 4,
      h: 5.5,
      wallColor: '#feebc8',
      roofColor: '#c53030',
      accentColor: '#9b2c2c',
      sign: 'APARTAMENTOS',
    },
  ];

  public props: Prop3D[] = [
    { type: 'tree', x: -2, z: 2 },
    { type: 'tree', x: 2, z: 2 },
    { type: 'tree', x: -1, z: -2 },
    { type: 'tree', x: 1, z: -2 },
    { type: 'tree', x: -10, z: -1 },
    { type: 'tree', x: 10, z: 1 },
    { type: 'bench', x: -3, z: 0 },
    { type: 'bench', x: 3, z: 0 },
    { type: 'lamp', x: -4, z: 2 },
    { type: 'lamp', x: 4, z: 2 },
    { type: 'lamp', x: -4, z: -2 },
    { type: 'lamp', x: 4, z: -2 },
    { type: 'bus', x: 7, z: 6.5 },
  ];

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /** Projeção 3D para coordenadas 2D do Canvas com profundidade */
  public project(x: number, y: number, z: number): { x: number; y: number; scale: number; depth: number } | null {
    // Vetor câmera -> alvo
    const camX = this.camera.x;
    const camY = this.camera.y;
    const camZ = this.camera.z;

    // Matriz de visualização simplificada baseada no ângulo de câmera
    const dx = x - camX;
    const dy = y - camY;
    const dz = z - camZ;

    // Rotação da câmera olhando para target
    const angleY = Math.atan2(this.camera.targetX - camX, this.camera.targetZ - camZ);
    const cosY = Math.cos(-angleY);
    const sinY = Math.sin(-angleY);

    const rx = dx * cosY - dz * sinY;
    const rz = dx * sinY + dz * cosY;

    const angleX = Math.atan2(camY - this.camera.targetY, Math.sqrt(dx * dx + dz * dz));
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    const ry = dy * cosX + rz * sinX;
    const depth = -dy * sinX + rz * cosX;

    if (depth <= 0.1) return null; // Atrás da câmera

    const scale = this.camera.fov / depth;
    const screenX = this.width / 2 + rx * scale;
    const screenY = this.height / 2 - ry * scale;

    return { x: screenX, y: screenY, scale, depth };
  }

  /** Renderiza toda a cena 3D com ordenação de profundidade (Painter's Algorithm) */
  public render(characters: Character3D[], activeScenarioPos?: [number, number, number]) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Céu e iluminação ambiente
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#bee3f8');
    skyGrad.addColorStop(0.55, '#ebf8ff');
    skyGrad.addColorStop(0.56, '#cbd5e0');
    skyGrad.addColorStop(1, '#edf2f7');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Piso urbano (Ruas e Calçadas)
    this.renderGround();

    // 3. Coleta de elementos 3D para ordenação de profundidade
    interface Renderable {
      depth: number;
      draw: () => void;
    }
    const renderables: Renderable[] = [];

    // Edifícios
    for (const b of this.buildings) {
      const p = this.project(b.x, 0, b.z);
      if (p) {
        renderables.push({
          depth: p.depth,
          draw: () => this.drawBuilding(b),
        });
      }
    }

    // Props (Árvores, Bancos, Postes, Ônibus)
    for (const prop of this.props) {
      const p = this.project(prop.x, 0, prop.z);
      if (p) {
        renderables.push({
          depth: p.depth,
          draw: () => this.drawProp(prop),
        });
      }
    }

    // Personagens (NPCs e Jogador)
    for (const c of characters) {
      const p = this.project(c.x, 0, c.z);
      if (p) {
        renderables.push({
          depth: p.depth,
          draw: () => this.drawCharacter(c),
        });
      }
    }

    // Marcador de missão ativa no solo
    if (activeScenarioPos) {
      const p = this.project(activeScenarioPos[0], 0.05, activeScenarioPos[2]);
      if (p) {
        renderables.push({
          depth: p.depth + 0.1,
          draw: () => this.drawActiveMarker(activeScenarioPos),
        });
      }
    }

    // Ordenação do mais distante para o mais próximo
    renderables.sort((a, b) => b.depth - a.depth);

    // Desenho ordenado
    for (const r of renderables) {
      r.draw();
    }
  }

  private renderGround() {
    const ctx = this.ctx;

    // Solo da praça
    const p1 = this.project(-16, 0, -16);
    const p2 = this.project(16, 0, -16);
    const p3 = this.project(16, 0, 16);
    const p4 = this.project(-16, 0, 16);

    if (p1 && p2 && p3 && p4) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
    }

    // Gramado central da praça
    const g1 = this.project(-3.5, 0.02, -3.5);
    const g2 = this.project(3.5, 0.02, -3.5);
    const g3 = this.project(3.5, 0.02, 3.5);
    const g4 = this.project(-3.5, 0.02, 3.5);

    if (g1 && g2 && g3 && g4) {
      ctx.beginPath();
      ctx.moveTo(g1.x, g1.y);
      ctx.lineTo(g2.x, g2.y);
      ctx.lineTo(g3.x, g3.y);
      ctx.lineTo(g4.x, g4.y);
      ctx.closePath();
      ctx.fillStyle = '#9ae6b4';
      ctx.fill();
      ctx.strokeStyle = '#68d391';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Faixas de pedestre
    for (let offset = -2; offset <= 2; offset += 1) {
      const c1 = this.project(offset * 0.8 - 0.2, 0.03, -4.5);
      const c2 = this.project(offset * 0.8 + 0.2, 0.03, -4.5);
      const c3 = this.project(offset * 0.8 + 0.2, 0.03, -3.8);
      const c4 = this.project(offset * 0.8 - 0.2, 0.03, -3.8);
      if (c1 && c2 && c3 && c4) {
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c4.x, c4.y);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  }

  private drawBuilding(b: Building3D) {
    const ctx = this.ctx;
    const hw = b.w / 2;
    const hd = b.d / 2;

    // 8 vértices do paralelepípedo
    const v000 = this.project(b.x - hw, 0, b.z - hd);
    const v100 = this.project(b.x + hw, 0, b.z - hd);
    const v101 = this.project(b.x + hw, 0, b.z + hd);
    const v001 = this.project(b.x - hw, 0, b.z + hd);

    const v010 = this.project(b.x - hw, b.h, b.z - hd);
    const v110 = this.project(b.x + hw, b.h, b.z - hd);
    const v111 = this.project(b.x + hw, b.h, b.z + hd);
    const v011 = this.project(b.x - hw, b.h, b.z + hd);

    if (!v000 || !v100 || !v101 || !v001 || !v010 || !v110 || !v111 || !v011) return;

    // Face frontal (z + hd)
    ctx.beginPath();
    ctx.moveTo(v001.x, v001.y);
    ctx.lineTo(v101.x, v101.y);
    ctx.lineTo(v111.x, v111.y);
    ctx.lineTo(v011.x, v011.y);
    ctx.closePath();
    ctx.fillStyle = b.wallColor;
    ctx.fill();
    ctx.strokeStyle = '#a0aec0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Face lateral (esquerda ou direita dependendo do ângulo)
    ctx.beginPath();
    ctx.moveTo(v101.x, v101.y);
    ctx.lineTo(v100.x, v100.y);
    ctx.lineTo(v110.x, v110.y);
    ctx.lineTo(v111.x, v111.y);
    ctx.closePath();
    ctx.fillStyle = '#cbd5e0';
    ctx.fill();
    ctx.stroke();

    // Teto / Topo
    ctx.beginPath();
    ctx.moveTo(v010.x, v010.y);
    ctx.lineTo(v110.x, v110.y);
    ctx.lineTo(v111.x, v111.y);
    ctx.lineTo(v011.x, v011.y);
    ctx.closePath();
    ctx.fillStyle = b.roofColor;
    ctx.fill();
    ctx.stroke();

    // Letreiro do Edifício
    const signPos = this.project(b.x, b.h * 0.75, b.z + hd + 0.05);
    if (signPos) {
      ctx.save();
      ctx.font = `bold ${Math.max(10, Math.floor(13 * signPos.scale))}px "Fredoka", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textMetrics = ctx.measureText(b.sign);
      const pad = 6;
      ctx.fillStyle = b.accentColor;
      ctx.fillRect(
        signPos.x - textMetrics.width / 2 - pad,
        signPos.y - 8,
        textMetrics.width + pad * 2,
        16,
      );
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.sign, signPos.x, signPos.y);
      ctx.restore();
    }
  }

  private drawProp(prop: Prop3D) {
    const ctx = this.ctx;
    const base = this.project(prop.x, 0, prop.z);
    if (!base) return;

    if (prop.type === 'tree') {
      const top = this.project(prop.x, 3.2, prop.z);
      if (!top) return;

      // Tronco
      ctx.beginPath();
      ctx.moveTo(base.x - 3 * base.scale, base.y);
      ctx.lineTo(base.x + 3 * base.scale, base.y);
      ctx.lineTo(base.x + 2 * base.scale, base.y - (base.y - top.y) * 0.4);
      ctx.lineTo(base.x - 2 * base.scale, base.y - (base.y - top.y) * 0.4);
      ctx.closePath();
      ctx.fillStyle = '#744210';
      ctx.fill();

      // Copa da árvore em camadas estilizadas
      const r = 24 * base.scale;
      ctx.beginPath();
      ctx.arc(top.x, top.y + r * 0.4, r, 0, Math.PI * 2);
      ctx.fillStyle = '#38a169';
      ctx.fill();
      ctx.strokeStyle = '#276749';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(top.x, top.y, r * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = '#48bb78';
      ctx.fill();
    } else if (prop.type === 'lamp') {
      const top = this.project(prop.x, 3, prop.z);
      if (!top) return;

      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 2 * base.scale;
      ctx.stroke();

      // Luminária
      ctx.beginPath();
      ctx.arc(top.x, top.y, 4 * base.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#fefcbf';
      ctx.fill();
      ctx.strokeStyle = '#d69e2e';
      ctx.stroke();
    } else if (prop.type === 'bench') {
      const p1 = this.project(prop.x - 0.7, 0.4, prop.z);
      const p2 = this.project(prop.x + 0.7, 0.4, prop.z);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#975a16';
        ctx.lineWidth = 6 * base.scale;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    } else if (prop.type === 'bus') {
      const p = this.project(prop.x, 1, prop.z);
      if (p) {
        ctx.save();
        ctx.fillStyle = '#3182ce';
        ctx.fillRect(p.x - 28 * p.scale, p.y - 18 * p.scale, 56 * p.scale, 28 * p.scale);
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(p.x - 22 * p.scale, p.y - 14 * p.scale, 44 * p.scale, 8 * p.scale);
        ctx.fillStyle = '#ecc94b';
        ctx.fillText('104', p.x - 8 * p.scale, p.y - 8 * p.scale);
        ctx.restore();
      }
    }
  }

  private drawCharacter(c: Character3D) {
    const ctx = this.ctx;
    const feet = this.project(c.x, 0, c.z);
    const head = this.project(c.x, 1.8, c.z);
    if (!feet || !head) return;

    const scale = feet.scale;
    const heightPx = feet.y - head.y;

    // Sombra no chão
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y, 10 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();

    // Corpo / Tronco
    const torsoY = feet.y - heightPx * 0.55;
    ctx.beginPath();
    ctx.roundRect(feet.x - 6 * scale, torsoY, 12 * scale, heightPx * 0.4, 4 * scale);
    ctx.fillStyle = c.bodyColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cabeça
    const headY = feet.y - heightPx * 0.85;
    ctx.beginPath();
    ctx.arc(feet.x, headY, 7 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#fed7aa'; // Pele amigável
    ctx.fill();

    // Cabelo
    ctx.beginPath();
    ctx.arc(feet.x, headY - 2 * scale, 7.5 * scale, Math.PI, Math.PI * 2);
    ctx.fillStyle = c.hairColor;
    ctx.fill();

    // Olhos e rosto
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(feet.x - 2.5 * scale, headY, 1 * scale, 0, Math.PI * 2);
    ctx.arc(feet.x + 2.5 * scale, headY, 1 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Nome flutuante
    ctx.save();
    ctx.font = `bold ${Math.max(10, Math.floor(11 * scale))}px "Fredoka", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = c.isPlayer ? '#2b6cb0' : '#2d3748';
    ctx.fillText(c.name, feet.x, headY - 14 * scale);

    // Ícone de missão ativa sobre a cabeça
    if (c.hasQuest) {
      ctx.beginPath();
      ctx.arc(feet.x, headY - 26 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ecc94b';
      ctx.fill();
      ctx.fillStyle = '#744210';
      ctx.font = `bold ${Math.max(10, Math.floor(12 * scale))}px sans-serif`;
      ctx.fillText('💬', feet.x, headY - 23 * scale);
    }

    ctx.restore();
  }

  private drawActiveMarker(pos: [number, number, number]) {
    const ctx = this.ctx;
    const p = this.project(pos[0], 0.05, pos[2]);
    if (!p) return;

    // Círculo pulsante de destino
    const r = 26 * p.scale;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(66, 153, 225, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 2 * p.scale;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
