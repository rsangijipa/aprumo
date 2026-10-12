import React, { useState } from 'react';
import { X, Search, ShieldCheck, AlertTriangle, Layers, Lock, Sliders, CheckCircle, ExternalLink } from 'lucide-react';
import { useNarrativeStore } from '../../narrative/engine/narrativeStore';

export const DetetiveDigitalModal: React.FC = () => {
  const { activeModal, setModal } = useNarrativeStore();
  const [tab, setTab] = useState<'url' | 'print' | 'perms' | 'password'>('url');

  // URL Detective State
  const [urlAnalyzed, setUrlAnalyzed] = useState(false);

  // Print Detective State
  const [revealContext, setRevealContext] = useState(false);

  // Permissions Detective State
  const [perms, setPerms] = useState({
    storage: true,
    microphone: false,
    location: false,
    contacts: false
  });

  // Password Detective State
  const [password, setPassword] = useState('');

  const calculatePasswordScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passScore = calculatePasswordScore(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="detetive-title"
        className="w-full max-w-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl p-6 text-[var(--text-primary)] relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={() => setModal(null)}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-[var(--primitive-color-turquesa-glow)] text-[var(--primitive-color-turquesa-400)]">
            <Search size={24} />
          </div>
          <div>
            <h2 id="detetive-title" className="text-lg font-bold text-[var(--text-primary)]">Laboratório Detetive Digital</h2>
            <p className="text-xs text-[var(--text-muted)]">Ferramentas de análise de evidências e segurança Nexo</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] mb-5 overflow-x-auto">
          <button
            onClick={() => setTab('url')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'url' ? 'bg-[var(--primitive-color-azul-500)] text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <ExternalLink size={14} /> Links
          </button>

          <button
            onClick={() => setTab('print')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'print' ? 'bg-[var(--primitive-color-azul-500)] text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Layers size={14} /> Prints
          </button>

          <button
            onClick={() => setTab('perms')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'perms' ? 'bg-[var(--primitive-color-azul-500)] text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Sliders size={14} /> Permissões
          </button>

          <button
            onClick={() => setTab('password')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'password' ? 'bg-[var(--primitive-color-azul-500)] text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Lock size={14} /> Senhas
          </button>
        </div>

        {/* 1. ABA DE LINKS */}
        {tab === 'url' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <span className="block text-[11px] text-[var(--text-muted)] font-mono mb-1">URL Suspeita em Análise:</span>
              <p className="font-mono text-xs text-[var(--primitive-color-coral-400)] break-all bg-[var(--primitive-color-pureblack)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                https://<span className="text-[var(--text-muted)] underline">galaxy-rivals-eventos</span>.<strong className="text-[var(--primitive-color-coral-400)] bg-[var(--primitive-color-coral-glow)] px-1 rounded">suporte-premio.xyz</strong>/login?ref=free-skin
              </p>
            </div>

            {!urlAnalyzed ? (
              <button
                onClick={() => setUrlAnalyzed(true)}
                className="w-full py-2.5 rounded-xl bg-[var(--primitive-color-turquesa-500)] hover:bg-[var(--primitive-color-turquesa-600)] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Search size={16} /> Dissecador de Domínio Nexo
              </button>
            ) : (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="p-3 rounded-xl bg-[var(--primitive-color-coral-glow)] border border-[var(--primitive-color-coral-500)]/40 text-[var(--primitive-color-coral-400)] flex items-start gap-2.5">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Phishing Identificado!</strong>
                    <p className="text-[11px] mt-1 text-[var(--text-secondary)]">
                      O nome famoso "galaxy-rivals-eventos" é apenas um subdomínio falso. O domínio real é <strong>suporte-premio.xyz</strong>, registrado há 48 horas em servidor anônimo.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  <strong className="block text-[var(--primitive-color-turquesa-400)] mb-1">Como se proteger:</strong>
                  • Olhe sempre para o trecho imediatamente antes da primeira barra única "/"<br/>
                  • Terminações estranhas (.xyz, .top, .free) são comuns em golpes de itens de jogos.<br/>
                  • Páginas oficiais de jogos têm o domínio exato da produtora.
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ABA DE PRINTS */}
        {tab === 'print' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Compare como um print recortado pode distorcer completamente o sentido de uma conversa.
            </p>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {revealContext ? 'Conversa Original Completa' : 'Print Recortado que Circulou no Feed'}
              </span>

              <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-sans text-xs">
                {revealContext ? (
                  <div className="space-y-2 text-[var(--text-primary)]">
                    <p className="text-[var(--text-muted)] text-[11px] italic">[Conversando sobre a maratona de anime]</p>
                    <p><strong>Rafa:</strong> O que você achou dos vilões daquele desenho novo?</p>
                    <p className="p-2 rounded-lg bg-[var(--primitive-color-turquesa-glow)] border border-[var(--primitive-color-turquesa-500)]/30">
                      <strong>Sam:</strong> "Eu odeio todo mundo dessa turma <span className="underline font-bold text-[var(--primitive-color-turquesa-400)]">de vilões daquele anime</span>, bando de falsos kkkkk"
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[var(--primitive-color-coral-glow)] border border-[var(--primitive-color-coral-500)]/40 text-[var(--primitive-color-coral-400)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--primitive-color-coral-400)] block mb-1">Corte Maldoso:</span>
                    "Eu odeio todo mundo dessa turma, bando de falsos"
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setRevealContext(!revealContext)}
              className="w-full py-2.5 rounded-xl bg-[var(--primitive-color-azul-500)] hover:bg-[var(--primitive-color-azul-600)] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Layers size={16} />
              {revealContext ? 'Ver Print Recortado' : 'Revelar Contexto Inteiro da Frase'}
            </button>
          </div>
        )}

        {/* 3. ABA DE PERMISSÕES */}
        {tab === 'perms' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Simule a concessão ideal para o app <strong>StickerMagic</strong>.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold">Armazenamento</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Salvar figurinhas no celular (Necessário)</span>
                </div>
                <input
                  type="checkbox"
                  checked={perms.storage}
                  onChange={(e) => setPerms({ ...perms, storage: e.target.checked })}
                  className="w-4 h-4 accent-[var(--primitive-color-turquesa-500)] rounded"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-[var(--primitive-color-coral-400)]">Microfone 24 horas</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Gravar som ambiente em segundo plano (Abusivo)</span>
                </div>
                <input
                  type="checkbox"
                  checked={perms.microphone}
                  onChange={(e) => setPerms({ ...perms, microphone: e.target.checked })}
                  className="w-4 h-4 accent-[var(--primitive-color-coral-500)] rounded"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-[var(--primitive-color-coral-400)]">Localização Precisa (GPS)</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Rastrear onde você está em tempo real (Abusivo)</span>
                </div>
                <input
                  type="checkbox"
                  checked={perms.location}
                  onChange={(e) => setPerms({ ...perms, location: e.target.checked })}
                  className="w-4 h-4 accent-[var(--primitive-color-coral-500)] rounded"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-[var(--primitive-color-coral-400)]">Agenda de Contatos</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Ler todos os números dos seus amigos (Abusivo)</span>
                </div>
                <input
                  type="checkbox"
                  checked={perms.contacts}
                  onChange={(e) => setPerms({ ...perms, contacts: e.target.checked })}
                  className="w-4 h-4 accent-[var(--primitive-color-coral-500)] rounded"
                />
              </div>
            </div>

            {perms.storage && !perms.microphone && !perms.location && !perms.contacts ? (
              <div className="p-3 rounded-xl bg-[var(--primitive-color-turquesa-glow)] text-[var(--primitive-color-turquesa-400)] text-xs flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Excelente! Configuração perfeita seguindo o princípio de privacidade por padrão.</span>
              </div>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)]">
                Dica: Marque apenas o que o aplicativo realmente precisa para funcionar.
              </p>
            )}
          </div>
        )}

        {/* 4. ABA DE SENHAS */}
        {tab === 'password' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Teste a força de senhas e frases-passe no medidor de entropia do Vault.
            </p>

            <input
              type="text"
              placeholder="Digite uma senha ou frase fictícia..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] font-mono"
            />

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>Força da Credencial</span>
                <span className={passScore >= 75 ? 'text-[var(--primitive-color-turquesa-400)]' : 'text-[var(--primitive-color-coral-400)]'}>
                  {passScore}% {passScore >= 75 ? '(Forte)' : passScore >= 50 ? '(Média)' : '(Fraca)'}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    passScore >= 75 
                      ? 'bg-[var(--primitive-color-turquesa-500)]' 
                      : passScore >= 50 
                      ? 'bg-[var(--primitive-color-azul-500)]' 
                      : 'bg-[var(--primitive-color-coral-500)]'
                  }`}
                  style={{ width: `${passScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
              <strong className="block text-[var(--primitive-color-azul-400)]">Dica de Ouro do Nexo:</strong>
              <p>
                Frases fáceis de lembrar para você, mas impossíveis para robôs adivinharem (ex: <code>Cafe-Com-Batata#2026</code>) são muito mais seguras do que combinações curtas como <code>senha123</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
