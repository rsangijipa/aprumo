import { useState, useEffect } from 'react';
import { Button, IconPrinter } from '@aprumo/ui';
import { playTones } from '@aprumo/game-sdk';

export interface ABCRecord {
  id: string;
  time: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  functionHypothesis: 'Fuga / Esquiva' | 'Acesso a Tangível' | 'Atenção Social' | 'Sensorial / Automático';
  notes?: string;
}

export function ABCFrequencyStudio() {
  const [count, setCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [targetBehaviorName, setTargetBehaviorName] = useState('Comportamento Desafiador');
  const [abcLog, setAbcLog] = useState<ABCRecord[]>([
    {
      id: '1',
      time: '14:05',
      antecedent: 'Apresentação de demanda de escrita (DTT)',
      behavior: 'Grito e jogar lápis no chão',
      consequence: 'Bloqueio motor suave e reapresentação com dica gestual',
      functionHypothesis: 'Fuga / Esquiva',
      notes: 'Demanda de 3ª repetição sem reforço prévio',
    },
    {
      id: '2',
      time: '14:18',
      antecedent: 'Término do tempo livre com tablet',
      behavior: 'Choro e recusa em levantar da cadeira',
      consequence: 'Uso de temporizador visual de 1 min para transição',
      functionHypothesis: 'Acesso a Tangível',
      notes: 'Transição aceita após o toque do sino',
    },
  ]);

  const [ant, setAnt] = useState('Demanda verbal ou tarefa de mesa');
  const [beh, setBeh] = useState('Grito ou vocalização disruptiva');
  const [con, setCon] = useState('Bloqueio motor e redirecionamento');
  const [hypo, setHypo] = useState<ABCRecord['functionHypothesis']>('Fuga / Esquiva');
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [startTime]);

  const addClick = () => {
    setCount((c) => c + 1);
    playTones([{ freq: 659.25, dur: 0.08, type: 'sine' }], 'normal');
  };

  const removeClick = () => {
    setCount((c) => Math.max(0, c - 1));
  };

  const addAbcRecord = () => {
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const rec: ABCRecord = {
      id: String(Date.now()),
      time: now,
      antecedent: ant,
      behavior: beh,
      consequence: con,
      functionHypothesis: hypo,
      notes: customNote.trim() || undefined,
    };
    setAbcLog((prev) => [rec, ...prev]);
    setCount((c) => c + 1);
    setCustomNote('');
    playTones([
      { freq: 440, dur: 0.1, type: 'sine' },
      { freq: 587.33, dur: 0.12, delay: 0.08, type: 'sine' },
    ], 'normal');
  };

  const exportCsv = () => {
    const rows = [
      ['Horario', 'Antecedente (A)', 'Comportamento (B)', 'Consequencia (C)', 'Hipotese de Funcao', 'Notas'],
      ...abcLog.map((r) => [r.time, `"${r.antecedent}"`, `"${r.behavior}"`, `"${r.consequence}"`, `"${r.functionHypothesis}"`, `"${r.notes ?? ''}"`]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registro_abc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ratePerMin = elapsedSecs > 0 ? ((count / elapsedSecs) * 60).toFixed(2) : '0.00';
  const mins = Math.floor(elapsedSecs / 60);
  const secs = elapsedSecs % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Real-time Clicker & Rate Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          background: 'var(--ap-surface)',
          padding: '1.5rem',
          borderRadius: '24px',
          border: '1px solid var(--ap-border)',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)', textTransform: 'uppercase' }}>
            Comportamento Alvo em Monitoramento:
          </span>
          <input
            type="text"
            className="ap-input"
            style={{ fontWeight: 700, marginTop: '0.25rem' }}
            value={targetBehaviorName}
            onChange={(e) => setTargetBehaviorName(e.target.value)}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)' }}>
            CONTAGEM TOTAL
          </span>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--ap-primary, #0d9488)', lineHeight: 1 }}>
            {count}
          </div>
          <span className="ap-xs ap-muted">
            Taxa: <strong>{ratePerMin}</strong> / min ({timeFormatted} decorridos)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <Button variant="ghost" onClick={removeClick} disabled={count === 0} aria-label="Subtrair 1">
            - 1
          </Button>
          <Button variant="primary" size="lg" onClick={addClick} aria-label="Adicionar 1 ocorrência">
            + 1 Ocorrência
          </Button>
        </div>
      </div>

      {/* ABC Event Recording Form */}
      <div
        style={{
          background: 'var(--ap-surface-sunken)',
          padding: '1.5rem',
          borderRadius: '20px',
          border: '1px solid var(--ap-border-strong)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1.1rem', color: 'var(--ap-text)' }}>
            📝 Registro Imediato de Tríplice Contingência (ABC)
          </strong>
          <span className="ap-xs ap-muted">Metodologia ABA & Análise Funcional</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <label className="ap-field">
            <span className="ap-label">Antecedente (A):</span>
            <select className="ap-select" value={ant} onChange={(e) => setAnt(e.target.value)}>
              <option value="Demanda verbal ou tarefa de mesa">Demanda verbal / tarefa</option>
              <option value="Transição entre atividades">Transição entre atividades</option>
              <option value="Atenção dividida com outra pessoa">Atenção dividida / direcionada a outro</option>
              <option value="Item ou brinquedo retirado">Item de preferência retirado</option>
              <option value="Sobrecarga sensorial de ruído/luz">Sobrecarga sensorial (ruído/aglomeração)</option>
              <option value="Tempo ocioso / espera longa">Tempo ocioso / espera prolongada</option>
            </select>
          </label>

          <label className="ap-field">
            <span className="ap-label">Comportamento (B):</span>
            <select className="ap-select" value={beh} onChange={(e) => setBeh(e.target.value)}>
              <option value="Grito ou vocalização disruptiva">Grito ou vocalização alta</option>
              <option value="Fuga da cadeira ou da sala">Fuga da cadeira ou da sala</option>
              <option value="Agressão motora contra o outro">Agressão motora (bater/empurrar)</option>
              <option value="Auto-lesivo (morder mão/bater cabeça)">Comportamento auto-lesivo</option>
              <option value="Jogar materiais ou derrubar mesa">Destruição de materiais / jogar no chão</option>
              <option value="Choro contínuo com bloqueio de resposta">Choro contínuo e recusa motora</option>
            </select>
          </label>

          <label className="ap-field">
            <span className="ap-label">Consequência (C):</span>
            <select className="ap-select" value={con} onChange={(e) => setCon(e.target.value)}>
              <option value="Bloqueio motor e redirecionamento">Bloqueio motor e redirecionamento</option>
              <option value="Pausa concedida / fuga mantida">Pausa concedida (fuga do estímulo)</option>
              <option value="Atenção verbal fornecida">Atenção verbal e consolo fornecido</option>
              <option value="Item devolvido à criança">Item devolvido</option>
              <option value="Redução do nível de exigência da tarefa">Redução de demanda / auxílio físico</option>
              <option value="Extinção planejada (sem reforço)">Extinção planejada sem atenção verbal</option>
            </select>
          </label>

          <label className="ap-field">
            <span className="ap-label">Hipótese Funcional:</span>
            <select className="ap-select" value={hypo} onChange={(e) => setHypo(e.target.value as ABCRecord['functionHypothesis'])}>
              <option value="Fuga / Esquiva">Fuga / Esquiva de Demanda</option>
              <option value="Acesso a Tangível">Acesso a Tangível / Atividade</option>
              <option value="Atenção Social">Atenção Social</option>
              <option value="Sensorial / Automático">Sensorial / Automático</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            className="ap-input"
            style={{ flex: 1 }}
            placeholder="Observações complementares do terapeuta (opcional)..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
          />
          <Button variant="primary" onClick={addAbcRecord}>
            + Gravar Registro ABC
          </Button>
        </div>
      </div>

      {/* Historical Event Log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--ap-text)' }}>
            Histórico de Ocorrências Registradas ({abcLog.length})
          </strong>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={exportCsv}>
              📥 Exportar CSV
            </Button>
            <Button variant="default" size="sm" onClick={() => window.print()} icon={<IconPrinter />}>
              Imprimir Relatório ABC
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {abcLog.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'var(--ap-surface)',
                border: '1px solid var(--ap-border)',
                borderRadius: '14px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-primary)' }}>
                  ⏱ {r.time} · Hipótese: <span style={{ color: 'var(--ap-text)' }}>{r.functionHypothesis}</span>
                </span>
                <span className="ap-xs ap-muted">ID #{r.id}</span>
              </div>
              <div style={{ fontSize: 'var(--ap-text-sm)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                <div><strong>A:</strong> {r.antecedent}</div>
                <div><strong>B:</strong> <span style={{ color: 'var(--ap-danger, #ef4444)', fontWeight: 600 }}>{r.behavior}</span></div>
                <div><strong>C:</strong> {r.consequence}</div>
              </div>
              {r.notes && (
                <div style={{ fontSize: 'var(--ap-text-xs)', fontStyle: 'italic', color: 'var(--ap-text-muted)' }}>
                  Nota: {r.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
