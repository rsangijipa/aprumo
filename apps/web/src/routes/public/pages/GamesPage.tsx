import type { ReactNode } from 'react';
import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';
import { ArtListener, ArtMatch, ArtTurns } from '../Landing';

interface GameItem {
  id: string;
  name: string;
  repertoire: string;
  age: string;
  summary: string;
  art?: ReactNode;
}

const GAMES: GameItem[] = [
  { id: 'match-lab', name: 'Match Lab', repertoire: 'Pareamento', age: '2 a 12+ anos', art: <ArtMatch />,
    summary: 'Mesa tátil de feltro para parear idênticos, cores, formas, categorias e funções, com 2 a 12 estímulos e posições contrabalanceadas.' },
  { id: 'missao-instrucao', name: 'Missão Instrução', repertoire: 'Ouvinte', age: '3 a 12 anos', art: <ArtListener />,
    summary: 'Estante iluminada com instrução falada e apoio visual: comandos de 1 a 3 etapas, relações espaciais e atributos combinados.' },
  { id: 'minha-vez-sua-vez', name: 'Minha Vez, Sua Vez', repertoire: 'Reciprocidade social', age: '3 a 10 anos', art: <ArtTurns />,
    summary: 'Construção cooperativa com sinalizador de turno, para treinar espera, alternância entre parceiros e regulação do toque.' },
  { id: 'espelho-magico', name: 'Espelho Mágico', repertoire: 'Imitação motora', age: '2 a 8 anos',
    summary: 'Avatar 3D que demonstra gestos simples, ações motoras finas e manipulação de objetos, com pontuação feita pelo terapeuta.' },
  { id: 'olha-comigo', name: 'Olha Comigo', repertoire: 'Atenção compartilhada', age: '2 a 7 anos',
    summary: 'Seguir pistas sociais — apontar e orientação da cabeça — em cenários limpos de quarto, parque e fazenda.' },
  { id: 'minimundos', name: 'MiniMundos', repertoire: 'Brincar simbólico', age: '3 a 11 anos',
    summary: 'Mundo modular em miniatura (casa, mercado, consultório) para exploração funcional e missões configuráveis, sem pontuação.' },
  { id: 'detetive-emocoes', name: 'Detetive das Emoções', repertoire: 'Cognição social', age: '6 a 15+ anos',
    summary: 'Identificar pistas de contexto, expressões faciais e entonação em situações sociais, aceitando mais de uma resposta válida.' },
  { id: 'circuito-executivo', name: 'Circuito Executivo', repertoire: 'Funções executivas', age: '7 a 16 anos',
    summary: 'Minijogos de controle inibitório (go/no-go), flexibilidade para trocar de regra e memória operacional visuoespacial.' },
  { id: 'missao-independencia', name: 'Missão Independência', repertoire: 'Autonomia e AVDs', age: '7 a 17 anos',
    summary: 'Desafios da vida real em 2D isométrico: arrumar a mochila, fazer a lista do mercado, conferir o troco e o itinerário.' },
  { id: 'pequeno-chef', name: 'Pequeno Chef', repertoire: 'Sequenciação', age: '4 a 14 anos',
    summary: 'Cozinha tátil para preparar receitas passo a passo, trabalhando sequência, coordenação e tolerância alimentar.' },
  { id: 'social-city', name: 'Social City 3D', repertoire: 'Competência social', age: '12 a 17 anos',
    summary: 'Cidade 3D para adolescentes com missões de conversa, atendimento na cafeteria, transporte e recusa de convites.' },
  { id: 'coop-escape-lab', name: 'Co-op Escape Lab', repertoire: 'Cooperação', age: '10 a 17 anos',
    summary: 'Laboratório para dois jogadores, com quebra-cabeças de alavancas e engrenagens e pistas que só um dos dois vê.' },
];

export default function GamesPage() {
  return (
    <PublicPageLayout
      eyebrow="Games"
      title={<>Jogos com propósito clínico e <em>respeito sensorial</em></>}
      lead="Cada jogo tem visual e ritmo próprios, adequados à idade. Todos devolvem os dados no mesmo protocolo, que alimenta o prontuário."
      ctaText="Ver jogos na demonstração"
      secondaryCtaText="Recursos terapêuticos"
      secondaryCtaHref="/recursos-terapeuticos"
    >
      <Section sunken eyebrow="Catálogo" title="12 jogos para ABA, Denver e neurodesenvolvimento">
        <ul className="lp-grid lp-unlist">
          {GAMES.map((game) => (
            <li key={game.id} id={game.id}>
              <article className="ap-game-card">
                {game.art && <div className="ap-game-card__art" aria-hidden="true">{game.art}</div>}
                <div className="ap-game-card__body">
                  <div className="lp-game-meta">
                    <span className="ap-badge">{game.repertoire}</span>
                    <span className="ap-xs ap-muted">{game.age}</span>
                  </div>
                  <h3 className="ap-game-card__title lp-game-title">{game.name}</h3>
                  <p className="ap-game-card__summary lp-game-summary">{game.summary}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        center
        eyebrow="Runtime de jogos"
        title="Nenhum jogo é uma caixa-preta"
        lead="A cada tentativa, o runtime registra tempo de reação, nível de dica, posição do toque e autocorreções."
      >
        <div className="lp-grid">
          <FeatureCard title="Isolamento e segurança">
            Cada jogo roda em um iframe isolado, sem acesso a dados cadastrais do paciente. A comunicação acontece
            apenas por mensagens validadas.
          </FeatureCard>
          <FeatureCard title="Adaptação sensorial">
            O profissional define animações completas ou estáticas, som normal ou silencioso e alvos de toque
            ampliados para quem tem dificuldade motora.
          </FeatureCard>
          <FeatureCard title="Carregamento sob demanda">
            Módulos pesados e motores 3D só são baixados quando a atividade começa, o que mantém o carregamento inicial
            leve.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
