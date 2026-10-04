import { Link, useParams } from 'react-router';
import { Card } from '@aprumo/ui';
import { db, useStore } from '../../data/store';

const SETTING: Record<string, string> = { clinic: 'Clínica', home: 'Casa', school: 'Escola', community: 'Comunidade', telehealth: 'Teleatendimento' };

export default function CaseSessions() {
  const { caseId = '' } = useParams();
  const st = useStore((s) => s);
  const sessions = st.sessions.filter((s) => s.caseId === caseId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <Card title="Sessões e evolução">
      <div style={{ overflowX: 'auto', margin: '-0.5rem' }}>
        <table className="ap-table">
          <thead>
            <tr><th>Data</th><th>Ambiente</th><th>Aplicador</th><th>Registros</th><th>Tela</th><th>Nota clínica</th></tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const n = st.facts.filter((f) => f.sessionId === s.id).length;
              const targets = new Set(st.facts.filter((f) => f.sessionId === s.id).map((f) => f.targetId)).size;
              return (
                <tr key={s.id}>
                  <td className="ap-tabular">
                    {s.status === 'active' ? <Link to={`/app/sessao/${s.id}`}>Em andamento</Link> : new Date(s.startedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td>{SETTING[s.setting]}</td>
                  <td>{db.professional(s.implementerId)?.shortName}</td>
                  <td className="ap-tabular">{s.model === 'ABA' ? `${n} tentativas · ${targets} alvos` : 'Rotinas Denver'}</td>
                  <td className="ap-tabular">{Math.round(s.screenSeconds / 60)} min</td>
                  <td className="ap-muted" style={{ maxWidth: 360 }}>{s.clinicalNote ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
