import React from 'react';
import type { SocialScriptRecord } from '../types/money';
import { Users, CheckCircle } from 'lucide-react';

interface SocialScriptRecorderProps {
  script: SocialScriptRecord;
  onChange: (script: SocialScriptRecord) => void;
}

export const SocialScriptRecorder: React.FC<SocialScriptRecorderProps> = ({
  script,
  onChange,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '16px 20px',
        border: '1.5px solid var(--tinta-15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
      }}
      id="social-script-recorder"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--igarape)' }}>
        <Users size={18} />
        <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          Interação Social no Caixa (Registro pelo Aplicador no Role-Play)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <button
          type="button"
          onClick={() => onChange({ ...script, greetedCashier: !script.greetedCashier })}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: script.greetedCashier ? '2px solid var(--vitoria-regia)' : '1.5px solid var(--tinta-15)',
            backgroundColor: script.greetedCashier ? 'rgba(45, 106, 79, 0.12)' : 'var(--fundo)',
            color: script.greetedCashier ? 'var(--vitoria-regia)' : 'var(--tinta-60)',
            fontFamily: 'var(--font-teen)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} />
          Cumprimentou o Caixa
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...script, answeredBagQuestion: !script.answeredBagQuestion })}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: script.answeredBagQuestion ? '2px solid var(--vitoria-regia)' : '1.5px solid var(--tinta-15)',
            backgroundColor: script.answeredBagQuestion ? 'rgba(45, 106, 79, 0.12)' : 'var(--fundo)',
            color: script.answeredBagQuestion ? 'var(--vitoria-regia)' : 'var(--tinta-60)',
            fontFamily: 'var(--font-teen)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} />
          Respondeu sobre Sacola
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...script, thankedCashier: !script.thankedCashier })}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: script.thankedCashier ? '2px solid var(--vitoria-regia)' : '1.5px solid var(--tinta-15)',
            backgroundColor: script.thankedCashier ? 'rgba(45, 106, 79, 0.12)' : 'var(--fundo)',
            color: script.thankedCashier ? 'var(--vitoria-regia)' : 'var(--tinta-60)',
            fontFamily: 'var(--font-teen)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} />
          Agradeceu e Despediu-se
        </button>
      </div>
    </div>
  );
};
