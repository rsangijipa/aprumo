import {
  Card,
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';
import {
  ArtListener,
  ArtMatch,
  
  
  ArtTurns,
} from '../Landing';

interface GameItem {
  id: string;
  name: string;
  repertoire: string;
  age: string;
  summary: string;
  artNode?: React.ReactNode;
}

const GAMES_LIST: GameItem[] = [
  {
    id: 'match-lab',
    name: 'Match Lab',
    repertoire: 'Pareamento (Matching)',
    age: '2–12+ anos',
    summary: 'Mesa tátil de feltro para pareamento de idênticos, cores, formas, categorias e funções. Níveis de 2 a 12 estímulos com contrabalanceamento geométrico.',
    artNode: <ArtMatch />,
  },
  {
    id: 'missao-instrucao',
    name: 'Missão Instrução',
    repertoire: 'Ouvinte (Listener)',
    age: '3–12 anos',
    summary: 'Estante iluminada com instrução falada e suporte visual. Resposta a comandos de 1 a 3 etapas, relações espaciais e atributos combinados.',
    artNode: <ArtListener />,
  },
  {
    id: 'minha-vez-sua-vez',
    name: 'Minha Vez, Sua Vez',
    repertoire: 'Reciprocidade Social',
    age: '3–10 anos',
    summary: 'Construção cooperativa com sinalizador de turno. Exercício de tolerância à espera, alternância entre parceiros e regulação de toque.',
    artNode: <ArtTurns />,
  },
  {
    id: 'espelho-magico',
    name: 'Espelho Mágico',
    repertoire: 'Imitação Motora',
    age: '2–8 anos',
    summary: 'Avatar 3D que demonstra gestos simples, ações motoras finas e manipulação de objetos lúdicos. Avaliação com pontuação do terapeuta.',
  },
  {
    id: 'olha-comigo',
    name: 'Olha Comigo',
    repertoire: 'Atenção Compartilhada',
    age: '2–7 anos',
    summary: 'Acompanhamento de pistas sociais (gestos de apontar e orientação de cabeça) em cenários limpos de quarto, parque e fazenda.',
  },
  {
    id: 'minimundos',
    name: 'MiniMundos Sandbox',
    repertoire: 'Brincar Simbólico',
    age: '3–11 anos',
    summary: 'Mundo modular miniaturizado (casa, mercado, consultório) para exploração funcional e missões configuráveis sem pressão por pontuação.',
  },
  {
    id: 'detetive-emocoes',
    name: 'Detetive das Emoções',
    repertoire: 'Cognição Social',
    age: '6–15+ anos',
    summary: 'Identificação de pistas contextuais, expressões faciais e entonações em cenários sociais complexos, admitindo respostas multifacetadas.',
  },
  {
    id: 'circuito-executivo',
    name: 'Circuito Executivo',
    repertoire: 'Funções Executivas',
    age: '7–16 anos',
    summary: 'Minijogos de controle inibitório (Go/No-Go), alternância flexível de regras e memória operacional visuoespacial de curta duração.',
  },
  {
    id: 'missao-independencia',
    name: 'Missão Independência',
    repertoire: 'Autonomia & AVDs',
    age: '7–17 anos',
    summary: 'Isométrico 2D com desafios da vida real: arrumação de mochila, lista de compras no mercado, cálculo de troco e conferência de itinerários.',
  },
  {
    id: 'pequeno-chef',
    name: 'Pequeno Chef',
    repertoire: 'Sequenciação & Culinária',
    age: '4–14 anos',
    summary: 'Ambiente culinário tátil com física leve para preparo de receitas reais passo a passo, estimulando tolerância alimentar e coordenação.',
  },
  {
    id: 'social-city-3d',
    name: 'Social City 3D',
    repertoire: 'Competência Social Juvenil',
    age: '12–17 anos',
    summary: 'Cenário urbano 3D contemporâneo para adolescentes com missões de conversação, atendimento em cafeteria, transporte e recusa de convites.',
  },
  {
    id: 'coop-escape-lab',
    name: 'Co-op Escape Lab',
    repertoire: 'Cooperação & Resolução',
    age: '10–17 anos',
    summary: 'Laboratório cooperativo a dois com quebra-cabeças físicos acionados por alavancas, engrenagens e compartilhamento de pistas exclusivas.',
  },
];

export default function GamesPage() {
  return (
    <PublicPageLayout
      eyebrow="Serious Games & Ensino Interativo"
      title={
        <>
          Jogos com propósito clínico, <em>telemetria precisa e respeito sensorial</em>
        </>
      }
      lead="Cada jogo tem o seu mundo visual e ritmo próprio, adaptado à faixa etária da criança ou do adolescente. Todos os dados devolvidos falam o mesmo protocolo e alimentam o prontuário clínico."
      ctaText="Acessar jogos na demonstração"
      ctaHref="/entrar"
      secondaryCtaText="Ver matriz clínica completa"
      secondaryCtaHref="/como-funciona"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Catálogo dos 12 Games Clínicos</span>
            <h2 className="lp-h2 ap-display">Projetados para intervenção em ABA, Denver e Neurodesenvolvimento</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {GAMES_LIST.map((game) => (
              <article key={game.id} className="ap-game-card">
                {game.artNode && (
                  <div className="ap-game-card__art" aria-hidden="true">
                    {game.artNode}
                  </div>
                )}
                <div className="ap-game-card__body">
                  <div className="ap-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="ap-badge">{game.repertoire}</span>
                    <span className="ap-xs ap-muted">{game.age}</span>
                  </div>
                  <strong className="ap-game-card__title" style={{ fontSize: 'var(--ap-text-lg)', marginTop: '0.25rem' }}>
                    {game.name}
                  </strong>
                  <p className="ap-game-card__summary" style={{ fontSize: 'var(--ap-text-sm)', lineHeight: '1.5' }}>
                    {game.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head lp-head--center">
            <span className="ap-eyebrow">Arquitetura de Jogos</span>
            <h2 className="lp-h2 ap-display">O Aprumo Game Runtime</h2>
            <p className="lp-sub">
              Nenhum jogo opera como uma "caixa preta". A cada tentativa, o runtime registra o tempo de reação, o nível de dica, a posição geométrica do toque e possíveis autocorreções.
            </p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <Card title="Isolamento Iframe & Segurança">
              <p className="ap-small ap-muted">
                O código do jogo roda em iframe sandbox isolado sem acesso a dados cadastrais do paciente. A comunicação se dá exclusivamente por mensagens validadas.
              </p>
            </Card>

            <Card title="Adaptação Sensorial Fina">
              <p className="ap-small ap-muted">
                O profissional configura se a criança recebe animações completas ou estáticas, áudio normal ou silencioso e alvos táteis ampliados para dificuldades motoras.
              </p>
            </Card>

            <Card title="Lazy Loading de Alta Performance">
              <p className="ap-small ap-muted">
                Módulos complexos e motores 3D (Three.js/Rapier) só são baixados quando a atividade específica é iniciada, mantendo o carregamento inicial leve e instantâneo.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
