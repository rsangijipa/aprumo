import { Link } from 'react-router';
import {
  Card,
  IconArrowRight,
  IconCheck,
  
  IconCloudOff,
  
  IconLock,
  
  
  
  IconTablet,
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function ProdutoPage() {
  return (
    <PublicPageLayout
      eyebrow="Ecossistema Clínico Integrado"
      title={
        <>
          Um ecossistema coeso para <em>intervenções de precisão</em>
        </>
      }
      lead="Do planejamento individualizado à análise visual em tempo real. O Aprumo integra supervisores, terapeutas, acompanhantes, famílias e pacientes num único fluxo com rigor metodológico."
      ctaText="Explorar demonstração interativa"
      ctaHref="/entrar"
      secondaryCtaText="Ver como funciona"
      secondaryCtaHref="/como-funciona"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Módulos da Plataforma</span>
            <h2 className="lp-h2 ap-display">Projetado para cada momento do ciclo terapêutico</h2>
            <p className="lp-sub">Cada ferramenta foi desenvolvida com foco no alvo clínico, eliminando planilhas fragmentadas e duplicidade de anotações.</p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Card title="Planejamento Operacional (PEI / Denver)">
              <p className="ap-small ap-muted">
                Construção de metas com definições operacionais, hierarquia de dicas, critérios de domínio versionados e esquemas de reforçamento específicos para cada alvo.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Alvos em ABA e passos trimestrais no Modelo Denver</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Controle estrito de versões sem apagar o histórico</li>
              </ul>
            </Card>

            <Card title="Aplicação de Sessão (SessionRunner)">
              <p className="ap-small ap-muted">
                Interface ergonômica touch-first para registro em 2 toques no tablet ou celular. Medição automática de latência, suporte a atalhos físicos e desfazimento seguro por 5s.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> 100% funcional sem conexão com a internet</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Registro de antecedentes, comportamentos e consequências (ABC)</li>
              </ul>
            </Card>

            <Card title="Análise Visual & Decisão Clínica">
              <p className="ap-small ap-muted">
                Gráficos com linhas de fase, critério duplo conservador (CDC), separação clara de acertos independentes vs com dica e motor de 15 regras clínicas transparentes.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Alertas fundamentados numericamente (R1 a R15)</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Detecção automática de dependência de dica e viés de posição</li>
              </ul>
            </Card>

            <Card title="Resource Studio & Suportes Visuais">
              <p className="ap-small ap-muted">
                Biblioteca clínica de suportes visuais prontos para uso em tela e impressão: Timer visual circular, Primeiro/Depois, Agenda, Economia de Fichas e Análise de Tarefa.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Interoperável com Open Board Format (OBF)</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Síntese de voz para tiras de comunicação alternativa</li>
              </ul>
            </Card>

            <Card title="Serious Games & Ensino Interativo">
              <p className="ap-small ap-muted">
                Catálogo de jogos construídos sobre o Aprumo Game Runtime com telemetria clínica padronizada. Adaptações de movimento, som e escala tátil por paciente.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Jogos 2D em Phaser e experiências 3D contemporâneas</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Presets táteis para infância e adolescência</li>
              </ul>
            </Card>

            <Card title="Portal da Família & Generalização">
              <p className="ap-small ap-muted">
                Canal direto de parceria com os cuidadores em linguagem acolhedora e acessível. Orientações em vídeo/texto, registro de oportunidades em casa e validação social.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Tarefas domésticas práticas com confirmação fácil</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Proteção estrita de sigilo para notas internas</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head lp-head--center">
            <span className="ap-eyebrow">Diferenciais Técnicos</span>
            <h2 className="lp-h2 ap-display">Construído com tecnologia de ponta para a rotina da saúde</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div className="ap-stack" style={{ gap: '0.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ap-sage-50)', color: 'var(--ap-sage-700)', display: 'grid', placeItems: 'center' }}>
                <IconCloudOff />
              </div>
              <strong style={{ fontSize: 'var(--ap-text-lg)' }}>Offline-First Real</strong>
              <p className="ap-small ap-muted">
                A sessão pode ser aplicada integralmente em locais sem sinal. Os dados permanecem criptografados no aparelho e são sincronizados com confirmação garantida.
              </p>
            </div>

            <div className="ap-stack" style={{ gap: '0.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ap-sage-50)', color: 'var(--ap-sage-700)', display: 'grid', placeItems: 'center' }}>
                <IconLock />
              </div>
              <strong style={{ fontSize: 'var(--ap-text-lg)' }}>Prontuário Imutável</strong>
              <p className="ap-small ap-muted">
                Em conformidade com as resoluções profissionais e a LGPD, registros clínicos nunca são deletados. Retificações geram adendos auditáveis com autor, data e motivo.
              </p>
            </div>

            <div className="ap-stack" style={{ gap: '0.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ap-sage-50)', color: 'var(--ap-sage-700)', display: 'grid', placeItems: 'center' }}>
                <IconTablet />
              </div>
              <strong style={{ fontSize: 'var(--ap-text-lg)' }}>Touch-First de Verdade</strong>
              <p className="ap-small ap-muted">
                Áreas de toque ampliadas (48px+), suporte completo a tablets e celulares com polegar, proteção contra toques involuntários e modo sensorial calmo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--deep">
        <div className="lp-wrap lp-final">
          <h2 className="ap-display" style={{ color: '#fff' }}>Experimente o Aprumo na prática</h2>
          <p className="lp-sub" style={{ color: '#b9cbc9', margin: 0 }}>
            Conheça o ambiente de demonstração completo com casos clínicos fictícios preparados para exploração imediata.
          </p>
          <Link className="ap-btn ap-btn--primary ap-btn--lg" to="/entrar">
            Acessar Demonstração Gratuita <IconArrowRight />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  );
}
