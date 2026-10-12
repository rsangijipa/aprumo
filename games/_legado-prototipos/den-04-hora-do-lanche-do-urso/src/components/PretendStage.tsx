import React from 'react';
import type { CharacterType, CharacterState, ScenePlace, PretendItem, ActionZone } from '../types/pretend';

interface PretendStageProps {
  character: CharacterType;
  state: CharacterState;
  place: ScenePlace;
  selectedItem: PretendItem | null;
  onZoneInteract: (zone: ActionZone) => void;
}

export const PretendStage: React.FC<PretendStageProps> = ({
  character,
  state,
  place,
  selectedItem,
  onZoneInteract,
}) => {
  return (
    <div className="pretend-stage-container">
      {/* Background Room Scene with Paper-cutout Styling */}
      <svg viewBox="0 0 800 500" className="pretend-svg-scene" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="wall-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={place === 'quarto' ? '#e0e7ff' : '#fef3c7'} />
            <stop offset="100%" stopColor={place === 'quarto' ? '#c7d2fe' : '#fed7aa'} />
          </linearGradient>
          <pattern id="tablecloth-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#3b82f6" opacity="0.35" />
            <rect x="20" width="20" height="20" fill="#ffffff" opacity="0.8" />
            <rect y="20" width="20" height="20" fill="#ffffff" opacity="0.8" />
            <rect x="20" y="20" width="20" height="20" fill="#3b82f6" opacity="0.35" />
          </pattern>
        </defs>

        {/* Room Wall */}
        <rect x="0" y="0" width="800" height="340" fill="url(#wall-grad)" />

        {/* Traditional Brazilian Clay Water Filter (Filtro de Barro) in corner */}
        <g transform="translate(670, 160)" opacity="0.85">
          <ellipse cx="40" cy="110" rx="30" ry="12" fill="#9a3412" />
          <path d="M 15 110 C 10 70, 70 70, 65 110 Z" fill="#c2410c" />
          <path d="M 20 65 C 15 30, 65 30, 60 65 Z" fill="#ea580c" />
          <circle cx="40" cy="20" r="10" fill="#9a3412" />
          <circle cx="40" cy="115" r="4" fill="#1e293b" />
          <text x="40" y="145" fontSize="10" textAnchor="middle" fill="#7c2d12" fontWeight="bold">
            Filtro de Barro
          </text>
        </g>

        {/* Table with Checked Tablecloth */}
        <path d="M 80 340 L 720 340 L 760 500 L 40 500 Z" fill="url(#tablecloth-pattern)" />
        <rect x="70" y="335" width="660" height="12" rx="4" fill="#2563eb" opacity="0.8" />

        {/* Plate & Cup on table */}
        <ellipse cx="400" cy="410" rx="90" ry="35" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
        <ellipse cx="400" cy="410" rx="60" ry="22" fill="#e2e8f0" />

        <g transform="translate(530, 370)">
          <rect x="0" y="0" width="36" height="50" rx="6" fill="#38bdf8" opacity="0.8" stroke="#0284c7" strokeWidth="2" />
          <line x1="6" y1="20" x2="30" y2="20" stroke="#bae6fd" strokeWidth="3" />
        </g>

        {/* Plush Bear Character Illustration */}
        <g transform="translate(400, 240)">
          {/* Bear Body */}
          <ellipse cx="0" cy="60" rx="85" ry="75" fill="#b45309" stroke="#78350f" strokeWidth="4" />
          {/* Tummy Patch */}
          <ellipse cx="0" cy="70" rx="55" ry="48" fill="#fde68a" />

          {/* Ears */}
          <circle cx="-65" cy="-75" r="28" fill="#b45309" stroke="#78350f" strokeWidth="4" />
          <circle cx="-65" cy="-75" r="15" fill="#fde68a" />
          <circle cx="65" cy="-75" r="28" fill="#b45309" stroke="#78350f" strokeWidth="4" />
          <circle cx="65" cy="-75" r="15" fill="#fde68a" />

          {/* Head */}
          <circle cx="0" cy="-30" r="75" fill="#b45309" stroke="#78350f" strokeWidth="4" />
          {/* Snout */}
          <ellipse cx="0" cy="-10" rx="38" ry="28" fill="#fde68a" />
          {/* Nose */}
          <ellipse cx="0" cy="-20" rx="14" ry="9" fill="#1e293b" />

          {/* Eyes depending on state */}
          {state === 'dormindo' ? (
            <>
              {/* Sleeping curved eyelids */}
              <path d="M -35 -40 Q -25 -32 -15 -40" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 15 -40 Q 25 -32 35 -40" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : state === 'sono' ? (
            <>
              {/* Heavy drowsy eyes */}
              <circle cx="-25" cy="-40" r="8" fill="#1e293b" />
              <circle cx="25" cy="-40" r="8" fill="#1e293b" />
              <path d="M -35 -48 L -15 -42" stroke="#451a03" strokeWidth="3" />
              <path d="M 35 -48 L 15 -42" stroke="#451a03" strokeWidth="3" />
            </>
          ) : state === 'ue' ? (
            <>
              {/* Confused one big one small eye */}
              <circle cx="-25" cy="-42" r="11" fill="#1e293b" />
              <circle cx="25" cy="-38" r="6" fill="#1e293b" />
              <path d="M -36 -56 Q -25 -64 -14 -56" stroke="#451a03" strokeWidth="4" fill="none" />
              <line x1="16" y1="-48" x2="34" y2="-48" stroke="#451a03" strokeWidth="3" />
            </>
          ) : (
            <>
              {/* Big friendly teddy bear eyes with sparkles */}
              <circle cx="-25" cy="-40" r="9" fill="#1e293b" />
              <circle cx="25" cy="-40" r="9" fill="#1e293b" />
              <circle cx="-22" cy="-43" r="3" fill="#ffffff" />
              <circle cx="28" cy="-43" r="3" fill="#ffffff" />
            </>
          )}

          {/* Mouth depending on state */}
          {state === 'comendo' && (
            <ellipse cx="0" cy="2" rx="14" ry="12" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
          )}
          {state === 'fome' && (
            <ellipse cx="0" cy="2" rx="18" ry="14" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
          )}
          {state === 'bebendo' && (
            <circle cx="0" cy="0" r="10" fill="#991b1b" />
          )}
          {state === 'sono' && (
            <ellipse cx="0" cy="4" rx="12" ry="18" fill="#991b1b" />
          )}
          {state === 'ue' && (
            <path d="M -15 6 Q 0 0 15 6" stroke="#7f1d1d" strokeWidth="3" fill="none" />
          )}
          {(state === 'neutro' || state === 'satisfeito' || state === 'dormindo') && (
            <path d="M -16 -2 Q 0 12 16 -2" stroke="#7f1d1d" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}

          {/* Dirty sauce marks on cheeks if sujo */}
          {state === 'sujo' && (
            <>
              <circle cx="-35" cy="5" r="7" fill="#dc2626" opacity="0.7" />
              <circle cx="32" cy="8" r="8" fill="#ca8a04" opacity="0.75" />
            </>
          )}

          {/* Blanket covering body if sleeping */}
          {state === 'dormindo' && (
            <path d="M -90 30 C -90 -10, 90 -10, 90 30 L 95 130 L -95 130 Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="4" />
          )}
        </g>
      </svg>

      {/* Interactive Action Hotspot Zones on Character */}
      <div className="zones-overlay">
        {/* Boca */}
        <button
          type="button"
          className={`action-zone-btn zone-boca ${selectedItem?.compatibleZones.includes('boca') ? 'zone-target' : ''}`}
          onClick={() => onZoneInteract('boca')}
          title="Boca (Comer / Beber)"
        >
          <span className="zone-hint">Boca</span>
        </button>

        {/* Rosto */}
        <button
          type="button"
          className={`action-zone-btn zone-rosto ${selectedItem?.compatibleZones.includes('rosto') ? 'zone-target' : ''}`}
          onClick={() => onZoneInteract('rosto')}
          title="Rosto (Limpar)"
        >
          <span className="zone-hint">Rosto</span>
        </button>

        {/* Cabeça */}
        <button
          type="button"
          className={`action-zone-btn zone-cabeca ${selectedItem?.compatibleZones.includes('cabeca') ? 'zone-target' : ''}`}
          onClick={() => onZoneInteract('cabeca')}
          title="Cabeça (Pentear)"
        >
          <span className="zone-hint">Cabeça</span>
        </button>

        {/* Corpo */}
        <button
          type="button"
          className={`action-zone-btn zone-corpo ${selectedItem?.compatibleZones.includes('corpo') ? 'zone-target' : ''}`}
          onClick={() => onZoneInteract('corpo')}
          title="Corpo (Cobrir / Dar banho)"
        >
          <span className="zone-hint">Corpo</span>
        </button>
      </div>

      {/* Floating State Bubble */}
      <div className="character-state-bubble">
        <span className="state-badge">
          {state === 'fome' && '😋 O urso está com fome! (nham nham)'}
          {state === 'comendo' && '🍴 Nham nham! Comendo gostoso!'}
          {state === 'satisfeito' && '😊 Tummy cheinho! Que delícia!'}
          {state === 'sede' && '💧 O urso está com sede! (glu glu)'}
          {state === 'bebendo' && '🥤 Glu glu glu! Água fresquinha!'}
          {state === 'sujo' && '🍓 O rostinho ficou sujinho! Precisa limpar!'}
          {state === 'sono' && '🥱 Bocejo... o urso está com sono!'}
          {state === 'dormindo' && '💤 Shhh... o ursinho está dormindo!'}
          {state === 'ue' && '🤔 Ué? Essa colher vai aí? Que engraçado!'}
          {state === 'neutro' && `🧸 Olá! Eu sou o ${character === 'urso' ? 'Ursinho' : 'Amiguinho'}!`}
        </span>
      </div>
    </div>
  );
};
