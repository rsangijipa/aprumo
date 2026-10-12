import React, { useState } from 'react';
import type { FeelingsThermometerState } from '../types/scene';
import { Heart, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface FeelingsThermometerProps {
  onSaveSelfReport: (state: FeelingsThermometerState) => void;
  lastState?: FeelingsThermometerState | null;
}

const STRATEGIES = [
  'Respirar fundo 3 vezes soltando o ar devagar',
  'Beber um copo de água gelada',
  'Pedir uma pausa de 2 minutos para descansar',
  'Apertar uma almofada ou bolinha antiestresse',
  'Conversar em tom calmo com quem estiver comigo',
  'Ouvir minha música favorita bem baixinho',
];

export const FeelingsThermometer: React.FC<FeelingsThermometerProps> = ({
  onSaveSelfReport,
  lastState,
}) => {
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(lastState?.level ?? 2);
  const [selectedWord, setSelectedWord] = useState<string>(lastState?.selectedEmotionWord ?? 'Tranquilo(a)');
  const [strategy, setStrategy] = useState<string>(lastState?.helpfulStrategy ?? STRATEGIES[0]);
  const [saved, setSaved] = useState(false);

  const thermometerLevels = [
    { lvl: 1, label: 'Muito Calmo(a)', emoji: '🟢', desc: 'Corpo relaxado, mente serena' },
    { lvl: 2, label: 'Tranquilo(a)', emoji: '🟡', desc: 'Tudo bem, disposto a participar' },
    { lvl: 3, label: 'Incomodado(a)', emoji: '🟠', desc: 'Começando a sentir agitação ou cansaço' },
    { lvl: 4, label: 'Muito Agitado(a)', emoji: '🔴', desc: 'Coração rápido, vontade de parar' },
    { lvl: 5, label: 'No Limite / Sobrecarga', emoji: '🟣', desc: 'Preciso de pausa e acolhimento imediato' },
  ];

  const handleSave = () => {
    soundManager.playSuccess();
    onSaveSelfReport({
      level,
      selectedEmotionWord: selectedWord,
      helpfulStrategy: strategy,
      timestamp: Date.now(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="module-section-box thermometer-container">
      <div className="module-title-row">
        <span className="module-tag">Módulo E5 (Autorrelato)</span>
        <h3 className="module-heading">Termômetro das Minhas Emoções</h3>
      </div>

      <div className="privacy-badge">
        <Lock className="w-4 h-4 text-indigo-700 inline mr-1" />
        <span>Registro confidencial de autorregulação: <strong>nunca entra em porcentagens de acerto ABA</strong>.</span>
      </div>

      <p className="module-instructions">
        Como você está se sentindo agora por dentro? Escolha o nível do seu termômetro interno:
      </p>

      {/* Thermometer Visual Scale */}
      <div className="thermometer-scale">
        {thermometerLevels.map((item) => {
          const isCurrent = level === item.lvl;
          return (
            <button
              key={item.lvl}
              type="button"
              className={`thermometer-btn ${isCurrent ? 'selected-lvl' : ''}`}
              onClick={() => {
                soundManager.playClick();
                setLevel(item.lvl as 1 | 2 | 3 | 4 | 5);
                setSelectedWord(item.label);
              }}
            >
              <div className="lvl-emoji">{item.emoji}</div>
              <div className="lvl-number">Nível {item.lvl}</div>
              <div className="lvl-label">{item.label}</div>
              <div className="lvl-desc">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Coping Strategies Picker */}
      <div className="strategies-section">
        <h4 className="strategies-heading">
          <Heart className="w-4 h-4 text-rose-500 inline mr-1" />
          Estratégia que pode me ajudar agora:
        </h4>
        <div className="strategies-grid">
          {STRATEGIES.map((strat) => (
            <button
              key={strat}
              type="button"
              className={`strategy-chip ${strategy === strat ? 'active-strat' : ''}`}
              onClick={() => {
                soundManager.playClick();
                setStrategy(strat);
              }}
            >
              {strat}
            </button>
          ))}
        </div>
      </div>

      <div className="thermometer-actions">
        <button
          type="button"
          className="save-selfreport-btn"
          onClick={handleSave}
        >
          <Sparkles className="w-5 h-5 mr-1" />
          Guardar Meu Registro de Emoções
        </button>
        {saved && (
          <span className="saved-confirm">
            <ShieldCheck className="w-5 h-5 text-emerald-600 inline mr-1" />
            Registro salvo com carinho e segurança!
          </span>
        )}
      </div>
    </div>
  );
};
