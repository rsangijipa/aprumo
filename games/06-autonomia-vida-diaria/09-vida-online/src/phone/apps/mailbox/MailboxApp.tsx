import React, { useState } from 'react';
import { ArrowLeft, Mail, AlertTriangle, ShieldCheck, Star } from 'lucide-react';
import { useNarrativeStore } from '../../../narrative/engine/narrativeStore';

export const MailboxApp: React.FC = () => {
  const { closeApp, setModal } = useNarrativeStore();
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);

  const EMAILS = [
    {
      id: 'mail_1',
      sender: 'Profa. Helena (Coordenação Feira)',
      from: 'helena.cordenacao@colegio-ficticio.edu.br',
      subject: 'Cronograma Oficial da Feira de Ciências 2026',
      date: 'Ontem 16:30',
      isFlagged: false,
      isPhishing: false,
      body: 'Caros alunos,\n\nParabéns pela dedicação nos projetos. Lembrando que a montagem dos estandes começa pontualmente às 08h no ginásio. Quaisquer dúvidas sobre material devem ser tiradas no grupo da turma.\n\nAtenciosamente,\nProfa. Helena'
    },
    {
      id: 'mail_2',
      sender: 'Suporte Nexo Urgente',
      from: 'seguranca-urgente@nexo-premios-update.net',
      subject: 'ALERTA: Sua conta será cancelada em 2 horas! Clique para validar',
      date: 'Hoje 09:12',
      isFlagged: true,
      isPhishing: true,
      body: 'ATENÇÃO USUÁRIO:\n\nIdentificamos atividade irregular no seu aparelho. Clique no link abaixo e confirme sua senha imediatamente para evitar a perda definitiva de todas as suas fotos e contatos.\n\n[LINK ENCURTADO SUSPEITO: http://nexo-auth-verify.xyz/reset]\n\nEquipe de Segurança Nexo'
    },
    {
      id: 'mail_3',
      sender: 'Nexo OS Notificações',
      from: 'sistema@nexo-os.internal',
      subject: 'Relatório Semanal de Atividades & Privacidade',
      date: 'Hoje 11:00',
      isFlagged: false,
      isPhishing: false,
      body: 'Olá!\n\nSeu dispositivo Nexo completou a análise semanal. Nenhuma brecha de segurança não tratada foi encontrada nos aplicativos do sistema. Continue praticando o pensamento crítico nas conversas diárias.'
    }
  ];

  const activeEmail = EMAILS.find((m) => m.id === selectedMailId);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-nexo-screen)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="px-4 py-3 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (selectedMailId ? setSelectedMailId(null) : closeApp())}
            aria-label="Voltar"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Mailbox Nexo</h1>
            <span className="text-[10px] text-[var(--text-muted)]">Caixa de Entrada</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {activeEmail ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">{activeEmail.date}</span>
                {activeEmail.isPhishing && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--primitive-color-coral-glow)] text-[var(--primitive-color-coral-400)] flex items-center gap-1">
                    <AlertTriangle size={12} /> Phishing Suspeito
                  </span>
                )}
              </div>

              <h2 className="text-sm font-bold text-[var(--text-primary)]">{activeEmail.subject}</h2>
              <div className="text-xs text-[var(--text-secondary)]">
                <span className="font-semibold">{activeEmail.sender}</span>
                <span className="block font-mono text-[11px] text-[var(--text-muted)]">{activeEmail.from}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {activeEmail.body}
            </div>

            {activeEmail.isPhishing && (
              <div className="p-3.5 rounded-2xl bg-[var(--primitive-color-coral-glow)] border border-[var(--primitive-color-coral-500)]/40 text-xs text-[var(--primitive-color-coral-400)] space-y-2">
                <strong className="block font-semibold">Análise Detetive do Nexo:</strong>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Repare no remetente falso (@nexo-premios-update.net) e no tom de pânico ("sua conta será cancelada em 2 horas"). Empresas sérias não cancelam contas sem aviso prévio oficial.
                </p>
                <button
                  onClick={() => setModal('minigame_url')}
                  className="py-1.5 px-3 rounded-lg bg-[var(--primitive-color-coral-500)] text-white text-xs font-semibold"
                >
                  Examinar Link Suspeito
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {EMAILS.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedMailId(email.id)}
                className="w-full text-left p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] transition-colors shadow-sm block"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px]">
                    {email.sender}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">{email.date}</span>
                </div>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] truncate">
                  {email.subject}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                  {email.body.replace(/\n/g, ' ')}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
