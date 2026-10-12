import React, { useState } from 'react';
import type { RampVariation, VehicleType } from '../types/ramp';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Unlock,
  Plus,
  Layers,
  Settings,
  Archive,
  Gauge,
  Sliders,
  Flag,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AdultControlStripProps {
  variation: RampVariation;
  rampAngle: number;
  raceMode: boolean;
  isGateOpen: boolean;
  onStartCountdown: () => void;
  onReleaseGate: () => void;
  onChangeAngle: (newAngle: number) => void;
  onSelectVariation: (v: RampVariation) => void;
  onToggleRaceMode: () => void;
  onGiveVehicleToChild: (type: VehicleType) => void;
  onOpenTrackBuilder: () => void;
  onCloseRoutine: () => void;
  onOpenDashboard: () => void;
}

export const AdultControlStrip: React.FC<AdultControlStripProps> = ({
  variation,
  rampAngle,
  raceMode,
  isGateOpen,
  onStartCountdown,
  onReleaseGate,
  onChangeAngle,
  onSelectVariation,
  onToggleRaceMode,
  onGiveVehicleToChild,
  onOpenTrackBuilder,
  onCloseRoutine,
  onOpenDashboard,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`adult-control-strip ${isOpen ? 'open' : 'collapsed'}`}>
      <button
        type="button"
        className="collapse-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Ocultar Painel do Adulto' : 'Exibir Painel do Adulto'}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        <span className="strip-label-indicator">Adulto (ESDM)</span>
      </button>

      {isOpen && (
        <div className="strip-content">
          <div className="strip-header">
            <span className="strip-badge">Mediador ESDM</span>
            <div className="phase-pill">Rampa Maluca</div>
          </div>

          {/* Core Countdown and Gate Release */}
          <div className="control-group climax-group">
            <label className="control-group-title">Largada & Antecipação Compartilhada:</label>
            <button
              type="button"
              className="adult-btn countdown-btn"
              onClick={onStartCountdown}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Contagem "Preparar... Apontar..."
            </button>
            <button
              type="button"
              className={`adult-btn release-gate-btn ${isGateOpen ? 'gate-open' : ''}`}
              onClick={onReleaseGate}
            >
              <Unlock className="w-4 h-4 mr-1" />
              {isGateOpen ? 'Trava Aberta (Veículo Desceu)' : 'Abrir Trava ("JÁ!")'}
            </button>
          </div>

          {/* Ramp Angle Slider */}
          <div className="control-group">
            <div className="flex justify-between items-center">
              <label className="control-group-title">
                <Gauge className="w-4 h-4 inline mr-1 text-sky-600" />
                Inclinação da Rampa:
              </label>
              <span className="text-xs font-bold text-slate-700">{rampAngle}°</span>
            </div>
            <input
              type="range"
              min={15}
              max={40}
              step={1}
              value={rampAngle}
              onChange={(e) => onChangeAngle(Number(e.target.value))}
              className="ramp-slider"
            />
          </div>

          {/* Material Control: Give Vehicle to Child */}
          <div className="control-group highlight-group">
            <label className="control-group-title">Oferecer Veículo (Pedido/Mand da Criança):</label>
            <div className="button-row">
              <button
                type="button"
                className="adult-btn give-btn"
                onClick={() => onGiveVehicleToChild('carro')}
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                🚗 Carro
              </button>
              <button
                type="button"
                className="adult-btn give-btn"
                onClick={() => onGiveVehicleToChild('caminhao')}
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                🚚 Caminhão
              </button>
              <button
                type="button"
                className="adult-btn give-btn"
                onClick={() => onGiveVehicleToChild('onibus')}
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                🚌 Ônibus
              </button>
            </div>
          </div>

          {/* Variations & Race Mode */}
          <div className="control-group">
            <label className="control-group-title">
              <Layers className="w-4 h-4 inline mr-1 text-indigo-600" />
              Variações da Rampa:
            </label>
            <div className="variation-chips">
              {(['padrao', 'ingreme', 'ponte-igarape', 'corrida', 'tunel', 'pinos'] as RampVariation[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`var-chip ${variation === v ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectVariation(v);
                  }}
                >
                  {v === 'padrao' && 'Padrão'}
                  {v === 'ingreme' && '⚡ Íngreme (40°)'}
                  {v === 'ponte-igarape' && '🌉 Igarapé'}
                  {v === 'corrida' && '🏁 Corrida'}
                  {v === 'tunel' && '🚇 Túnel'}
                  {v === 'pinos' && '🎳 Pinos'}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`adult-btn race-toggle-btn ${raceMode ? 'active-race' : ''}`}
              onClick={onToggleRaceMode}
            >
              <Flag className="w-4 h-4 mr-1" />
              {raceMode ? 'Modo Corrida Ativo (2 Veículos)' : 'Ativar Corrida Adulto x Criança'}
            </button>
          </div>

          {/* Footer & TrackBuilder */}
          <div className="control-group footer-group">
            <button
              type="button"
              className="adult-btn trackbuilder-btn"
              onClick={onOpenTrackBuilder}
            >
              <Sliders className="w-4 h-4 mr-1 text-purple-600" />
              TrackBuilder (Pistas JSON)
            </button>
            <div className="action-row">
              <button
                type="button"
                className="adult-btn dashboard-btn"
                onClick={onOpenDashboard}
              >
                <Settings className="w-4 h-4 mr-1" />
                Métricas ESDM
              </button>
              <button
                type="button"
                className="adult-btn close-routine-btn"
                onClick={onCloseRoutine}
              >
                <Archive className="w-4 h-4 mr-1" />
                Estacionar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
