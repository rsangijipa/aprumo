import { useState } from 'react';
import { Button, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export function BehaviorContractStudio() {
  const [childName, setChildName] = useState('Lucas');
  const [therapistName, setTherapistName] = useState('Dra. Amanda (Terapeuta ABA)');
  const [familyName, setFamilyName] = useState('Mamãe e Papai');
  const [targetBehavior, setTargetBehavior] = useState(
    'Fazer as atividades da mesa usando as mãos com calma e pedir intervalo com o cartão de pausa sempre que me sentir cansado.'
  );
  const [reward, setReward] = useState('20 minutos de jogo no tablet + escolher o almoço de sábado');
  const [criterion, setCriterion] = useState('Cumprir em 4 de 5 sessões da semana');
  const [date] = useState(() => new Date().toLocaleDateString('pt-BR'));
  const [signed, setSigned] = useState(false);

  const presetContracts = [
    {
      title: 'Permanência na Mesa & Pedido de Pausa',
      behavior: 'Realizar as tarefas escolares na mesa até o timer soar, pedindo ajuda ou pausa sem gritar.',
      reward: '15 minutos de massinha e escolha do próximo jogo.',
      criterion: 'Durante toda a sessão de 45 minutos com no máximo 1 lembrete verbal.',
    },
    {
      title: 'Transições Calmas sem Fuga',
      behavior: 'Guardar os brinquedos quando o sinal tocar e caminhar para a próxima sala sem deitar no chão.',
      reward: 'Carimbo de estrela dourada + parquinho no final.',
      criterion: 'Em todas as transições da manhã.',
    },
    {
      title: 'Compartilhar e Esperar a Vez',
      behavior: 'Esperar a minha vez no jogo de tabuleiro sem puxar as peças do colega.',
      reward: 'Ser o líder da fila do recreio.',
      criterion: 'Completar 3 rodadas de jogo cooperativo.',
    },
  ];

  const handleSign = () => {
    setSigned(true);
    playTones([
      { freq: 523.25, dur: 0.15, type: 'sine' },
      { freq: 659.25, dur: 0.15, delay: 0.12, type: 'sine' },
      { freq: 783.99, dur: 0.25, delay: 0.24, type: 'sine' },
    ], 'normal');
    void speak(`Contrato firmado com sucesso para ${childName}! Parabéns pelo compromisso!`, 'normal');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Preset Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)' }}>
          MODELOS CLÍNICOS:
        </span>
        {presetContracts.map((p) => (
          <button
            key={p.title}
            type="button"
            className="rs-tab-pill"
            onClick={() => {
              setTargetBehavior(p.behavior);
              setReward(p.reward);
              setCriterion(p.criterion);
              setSigned(false);
            }}
          >
            📋 {p.title}
          </button>
        ))}
      </div>

      {/* Contract Formal Document */}
      <div
        className="rs-contract-document"
        style={{
          background: 'var(--ap-surface, #ffffff)',
          border: '3px double var(--ap-border-strong, #cbd5e1)',
          borderRadius: '24px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          boxShadow: 'var(--ap-shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--ap-primary, #0d9488)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--ap-primary, #0d9488)', textTransform: 'uppercase' }}>
            Protocolo Clínico de Contingência ABA
          </span>
          <h2 style={{ margin: '0.25rem 0', fontSize: '1.75rem', fontWeight: 900, color: 'var(--ap-text)' }}>
            📜 Contrato Comportamental de Conquistas
          </h2>
          <span className="ap-xs ap-muted">Data do Pacto: {date}</span>
        </div>

        {/* Parties */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <label className="ap-field">
            <span className="ap-label">Aprendiz (Criança / Adolescente):</span>
            <input
              type="text"
              className="ap-input"
              value={childName}
              onChange={(e) => {
                setChildName(e.target.value);
                setSigned(false);
              }}
            />
          </label>
          <label className="ap-field">
            <span className="ap-label">Terapeuta Responsável:</span>
            <input
              type="text"
              className="ap-input"
              value={therapistName}
              onChange={(e) => setTherapistName(e.target.value)}
            />
          </label>
          <label className="ap-field">
            <span className="ap-label">Família / Apoio:</span>
            <input
              type="text"
              className="ap-input"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </label>
        </div>

        {/* Commitment Statement */}
        <div style={{ background: 'var(--ap-surface-sunken, #f8fafc)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--ap-border)' }}>
          <strong style={{ display: 'block', color: 'var(--ap-primary)', marginBottom: '0.4rem', fontSize: '1.05rem' }}>
            1. Meu Compromisso (O que eu vou fazer):
          </strong>
          <textarea
            className="ap-input"
            rows={3}
            style={{ width: '100%', font: 'inherit', resize: 'vertical' }}
            value={targetBehavior}
            onChange={(e) => {
              setTargetBehavior(e.target.value);
              setSigned(false);
            }}
          />
        </div>

        {/* Criterion & Reward */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'var(--ap-surface-sunken)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--ap-border)' }}>
            <strong style={{ display: 'block', color: 'var(--ap-text)', marginBottom: '0.4rem' }}>
              2. Critério de Conquista:
            </strong>
            <input
              type="text"
              className="ap-input"
              value={criterion}
              onChange={(e) => setCriterion(e.target.value)}
            />
          </div>
          <div style={{ background: 'var(--ap-terra-100, #fef3c7)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--ap-terra-300)' }}>
            <strong style={{ display: 'block', color: 'var(--ap-terra-800)', marginBottom: '0.4rem' }}>
              🎁 3. Minha Recompensa Pactuada:
            </strong>
            <input
              type="text"
              className="ap-input"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--ap-border)',
            textAlign: 'center',
          }}
        >
          {/* Child Signature Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '100%',
                height: '70px',
                border: '2px dashed var(--ap-border-strong)',
                borderRadius: '12px',
                display: 'grid',
                placeItems: 'center',
                background: signed ? 'var(--ap-success-soft)' : '#ffffff',
                color: signed ? 'var(--ap-success)' : 'var(--ap-text-muted)',
                fontWeight: 800,
                fontSize: signed ? '1.5rem' : '0.85rem',
              }}
            >
              {signed ? `✍️ ${childName} ⭐` : 'Assinatura / Desenho da Criança'}
            </div>
            <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 700 }}>{childName}</span>
          </div>

          {/* Therapist Signature Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '100%',
                height: '70px',
                borderBottom: '2px solid var(--ap-border-strong)',
                display: 'grid',
                placeItems: 'center',
                fontStyle: 'italic',
                color: 'var(--ap-primary)',
              }}
            >
              {signed ? therapistName : ''}
            </div>
            <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 700 }}>{therapistName}</span>
          </div>

          {/* Family Signature Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '100%',
                height: '70px',
                borderBottom: '2px solid var(--ap-border-strong)',
                display: 'grid',
                placeItems: 'center',
                fontStyle: 'italic',
              }}
            >
              {signed ? familyName : ''}
            </div>
            <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 700 }}>{familyName}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant={signed ? 'default' : 'primary'}
          size="lg"
          onClick={handleSign}
        >
          {signed ? '✅ Contrato Firmado!' : '✍️ Firmar Contrato Juntos'}
        </Button>
        <Button variant="default" onClick={handlePrint} icon={<IconPrinter />}>
          Imprimir Contrato Oficial
        </Button>
      </div>
    </div>
  );
}
