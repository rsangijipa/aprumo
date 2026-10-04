import { useEffect, useState } from 'react';
import { Badge, Button, Card, IconCheck, IconLock, IconShield, Segmented, Toast, PageHeader } from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { isSupabaseConfigured } from '../../data/supabase';
import { actions, db, outbox, syncNow, useStore } from '../../data/store';
import './forms.css';

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const pending = useStore((s) => s.pendingSync);
  const me = db.professional(CURRENT_USER_ID)!;
  const [toast, setToast] = useState<string | null>(null);
  const [storage, setStorage] = useState<string | null>(null);

  useEffect(() => {
    void navigator.storage?.estimate?.().then((e) => setStorage(e.usage != null ? `${(e.usage / 1024 / 1024).toFixed(1)} MB` : null));
  }, [pending]);

  return (
    <>
      <PageHeader title="Configurações" description="Seu perfil, aparência, segurança e dados guardados neste aparelho." />
      <div className="grid-2">
        <Card title="Perfil profissional">
          <dl className="review">
            <dt>Nome</dt><dd>{me.name}</dd>
            <dt>Função</dt><dd>{me.role}</dd>
            <dt>Registro no conselho</dt><dd>{me.council ?? 'Não informado'}</dd>
          </dl>
          <p className="pro-footnote">O registro no conselho é exigido para finalizar documentos (Res. CFP 06/2019).</p>
        </Card>

        <Card title="Aparência e leitura">
          <div className="profile-grid">
            <div className="profile-row">
              <div><strong className="ap-small">Tema</strong><small>O escuro reduz o brilho em salas com pouca luz.</small></div>
              <Segmented label="Tema" value={settings.theme} onChange={(v) => actions.updateSettings({ theme: v })} options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro' }]} />
            </div>
            <div className="profile-row">
              <div><strong className="ap-small">Fonte de alta legibilidade</strong><small>Atkinson Hyperlegible, para baixa visão ou dificuldade de leitura.</small></div>
              <Segmented label="Fonte" value={settings.legibleFont ? 'on' : 'off'} onChange={(v) => actions.updateSettings({ legibleFont: v === 'on' })} options={[{ value: 'off', label: 'Padrão' }, { value: 'on', label: 'Alta legibilidade' }]} />
            </div>
          </div>
        </Card>

        <Card title="Segurança">
          <ul className="pro-list">
            <li className="pro-list__row ap-small"><span className="pro-icon-label"><IconLock /> Verificação em duas etapas</span>{isSupabaseConfigured ? <Badge tone="success"><IconCheck /> obrigatória</Badge> : <Badge>demonstração</Badge>}</li>
            <li className="pro-list__row ap-small"><span className="pro-icon-label"><IconShield /> Sessão neste aparelho</span><span className="ap-xs ap-muted">encerra ao fechar a aba</span></li>
          </ul>
          <p className="pro-footnote">Toda leitura de prontuário fica registrada na trilha de auditoria do caso.</p>
        </Card>

        <Card title="Dados neste aparelho">
          <div className="ap-stack pro-gap-sm">
            <p className="ap-small">
              {pending === 0 ? 'Todos os registros foram enviados.' : `${pending} registro(s) aguardando envio, guardados com criptografia.`}
              {storage && <span className="ap-muted"> · uso local: {storage}</span>}
            </p>
            <div className="ap-row">
              <Button onClick={() => { void syncNow(); setToast('Sincronização solicitada.'); }}>Sincronizar agora</Button>
              <Button variant="danger" disabled={pending > 0} onClick={async () => { await outbox?.wipe(); setToast('Dados locais apagados deste aparelho.'); }}>Apagar dados locais</Button>
            </div>
            <p className="ap-xs ap-muted">Só é possível apagar quando não há registros pendentes, para nenhuma tentativa se perder.</p>
          </div>
        </Card>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
