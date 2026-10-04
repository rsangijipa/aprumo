# APRUMO — AUDITORIA COMPLETA DA APLICAÇÃO (FULL AUDIT)

**Data:** Outubro de 2026  
**Versão da Auditoria:** 2.0.0  
**Status do Ecossistema:** Análise Global Preliminar à Implementação  
**Ambiente:** Monorepo pnpm (`apps/web`, `packages/*`, `games/*`, `resources/*`, `supabase`)

---

## 1. Visão Geral da Arquitetura Atual

O **Aprumo** é uma plataforma integrada voltada para Análise do Comportamento Aplicada (ABA), Modelo Denver de Intervenção Precoce (ESDM), supervisores, acompanhantes terapêuticos (AT), famílias, crianças e adolescentes atípicos.

### 1.1 Topologia do Workspace
- **`apps/web`**: Aplicação principal em React 19 + Vite 8 + React Router 8 + TanStack Query 5. Funciona offline-first via Service Worker e IndexedDB (outbox criptografada).
- **`packages/protocol`**: Contratos Zod para sessões (`SessionConfig`), eventos de telemetria (`EventEnvelope`, `EventPayloads`), adaptações sensoriais (`Adaptation`) e manifestos clínicos (`GameManifest`).
- **`packages/game-sdk`**: Runtime cliente e host para isolamento de jogos em iframe (`attachGameHost`, `useGameClient`, `useTrialRunner`, síntese Web Audio, TTS).
- **`packages/clinical-core`**: Algoritmos de cálculo de domínio, resumo de sessões, taxa de resposta e análise visual CDC (Conservative Dual-Criterion).
- **`packages/ui`**: Design tokens (`tokens.css`), componentes básicos e ícones SVG padronizados.
- **`packages/stimuli`**: Acervo compartilhado de ilustrações vetoriais e vocabulário semântico.
- **`games/*`**: 9 jogos clínicos já catalogados (`encontre-o-igual`, `escolha-pela-instrucao`, `minha-vez-sua-vez`, `organize-categoria`, `memoria-bichos`, `historia-ordem`, `pequeno-chef`, `missao-independencia`, `causa-efeito`).
- **`resources/*`**: Recursos de apoio autônomos (`quadro-de-fichas`, `agenda-visual`).
- **`supabase`**: Esquema relacional Postgres com migrações 0001–0008, RLS estrita por vínculo clínico e triggers de imutabilidade.

---

## 2. Mapeamento Completo de Rotas, Superfícies e Layouts

| Rota | Superfície / Módulo | Layout / Shell | Perfil de Usuário | Finalidade Clínica / Operacional |
|---|---|---|---|---|
| `/` | **Landing Page** | `Landing` (público) | Público, Novos Clientes | Apresentação da proposta de valor, ciclo clínico e fundamentação |
| `/entrar` | **Autenticação Multi-Perfil** | `Login` | Pro, Família, Criança | Acesso ao sistema (Profissional AAL2, Família AAL1, Código Infantil) |
| `/app` | **Dashboard Pro** | `ProLayout` (Sidebar + Topbar) | Supervisor / Terapeuta | Visão do dia, métricas da equipe, atalhos rápidos e alertas |
| `/app/casos` | **Lista de Casos** | `ProLayout` | Terapeuta / Supervisor | Catálogo de pacientes ativos/inativos, modelos (ABA/Denver) |
| `/app/casos/novo` | **Assistente de Novo Caso** | `ProLayout` | Responsável Técnico | Wizard de admissão: identificação, perfil sensorial, consentimentos |
| `/app/casos/:caseId` | **Visão Geral do Caso** | `CaseLayout` (Tabs internas) | Equipe do caso | Dashboard individual: metas vigentes, linha do tempo, atalhos |
| `/app/casos/:caseId/plano` | **Plano Individual (PEI)** | `CaseLayout` | Supervisor / Terapeuta | Editor hierárquico: Objetivos → Programas → Alvos / Passos Denver |
| `/app/casos/:caseId/dados` | **Análise Visual & Gráficos**| `CaseLayout` | Supervisor / Analista | Curvas de aquisição, linhas de fase, critério CDC, tabela de tentativas |
| `/app/casos/:caseId/sessoes` | **Histórico de Sessões** | `CaseLayout` | Terapeuta / Supervisor | Relação de atendimentos, notas obrigatórias, tempo de sessão |
| `/app/casos/:caseId/comportamento`| **Registro de Comportamento**| `CaseLayout` | Terapeuta / AT | Definições operacionais, plano de manejo, frequência/duração |
| `/app/casos/:caseId/reforcadores` | **Inventário de Reforço** | `CaseLayout` | Terapeuta | MSWO (avaliação de preferência), ranking e cálculo de saciação |
| `/app/casos/:caseId/perfil` | **Perfil & Acomodações** | `CaseLayout` | Terapeuta Ocupacional | Calibração de estímulos sensoriais e pré-requisitos digitais |
| `/app/casos/:caseId/familia` | **Acompanhamento Familiar** | `CaseLayout` | Terapeuta / Família | Envio e validação de tarefas de generalização domiciliar |
| `/app/casos/:caseId/documentos` | **Prontuário & Relatórios**| `CaseLayout` | Responsável Técnico | Editor de laudos e relatórios (Res. CFP 06/2019) imutáveis |
| `/app/alertas` | **Central de Alertas** | `ProLayout` | Supervisor Clínico | Motor de regras R1–R15 (domínio, dependência de dica, posição) |
| `/app/recursos` | **Resource Studio** | `ProLayout` | Toda a equipe | Biblioteca de ferramentas visuais interativas e jogos |
| `/app/ferramentas/plano-individual`| **Construtor de PEI/PIC** | `ProLayout` | Equipe Multidisciplinar | Ferramenta livre para elaboração e exportação de planos |
| `/app/supervisao` | **Supervisão & Fidelidade** | `ProLayout` | Supervisor | Checklists de fidelidade procedural e cálculo de IOA |
| `/app/equipe` | **Gestão de Equipe** | `ProLayout` | Administrador Clínico | Gestão de papéis, profissionais e atribuição por caso |
| `/app/configuracoes` | **Configurações do Aparelho**| `ProLayout` | Profissional | Temas (claro/escuro), fonte hiperlegível, outbox offline |
| `/app/sessao/:sessionId` | **SessionRunner (Execução)** | Barra superior minimalista | Aplicador / Terapeuta | Coleta tentativa a tentativa, atalhos de teclado, latência, undo 5s |
| `/crianca/:sessionId` | **ChildShell (Em Sessão)** | Moldura infantil fechada | Criança em atendimento | Execução de jogo orientada pelo terapeuta com ficha e agenda |
| `/familia` | **Portal da Família** | Shell acolhedor familiar | Pais / Responsáveis | Metas em linguagem acessível, tarefas de casa e orientações |
| `/espaco/:childId` | **Espaço Autônomo** | Shell adaptativo por idade | Criança / Adolescente | Estrelas, álbum de figurinhas, prancha, calma, modo teen |
| `/espaco/:childId/jogar/:appId`| **PlayShell (Treino Livre)**| Moldura livre com timer | Criança / Adolescente | Prática sem registro de prontuário, controle de tempo de tela |
| `*` | **Tratamento de Erros** | Página isolada | Todos | Tela 404 e boundary de recuperação resiliente |

---

## 3. Diagnóstico de Inconsistências e Problemas Identificados

### 3.1 Navegação e Telas Sem Botão de Retorno (Back Navigation)
1. **Página de Erro (`RouteError.tsx`)**: O botão de retorno aponta rigidamente para `/app`, sem considerar se o usuário veio da Landing Page pública ou de um portal familiar, gerando desorientação e potencial erro de permissão.
2. **Subtelas do Caso (`CaseLayout.tsx`)**: Caso um paciente não seja encontrado ou haja erro de parâmetro, a mensagem exibida não contém botão para retornar à lista de casos (`/app/casos`), deixando o usuário preso.
3. **Página de Recursos (`Library.tsx`)**: Quando um recurso interativo é aberto no modal de tela cheia, a saída depende do clique no `X` ou `Esc`; não há botão explícito de "Concluir / Voltar ao Catálogo" com área confortável para toque.
4. **Espaço Livre Infantil (`PlayShell.tsx`)**: O botão de saída necessita de confirmação de adulto clara e tamanho mínimo de toque de 48px para não ser acionado por toques acidentais ou impedir a saída do responsável.
5. **Ausência de Breadcrumbs Estruturados**: As telas internas do caso (`/app/casos/:caseId/plano`, `dados`, etc.) não exibem trilha de navegação (Ex.: `Início > Casos > Teo > Plano`), dificultando a percepção de hierarquia em telas de tablet e desktop.

### 3.2 Ícones Clicáveis e Hit Area (Touch-First & WCAG 2.2)
1. **Tamanho Físico vs. Hit Area**: Vários botões de ícone na aplicação possuem tamanho visual de 16–20px e padding que resulta em hit area inferior a 44px (Ex.: botões de fechar tags, ícones de filtro, setas de paginação em tabelas, botões de ação rápida em linhas de tabela).
2. **Botões de Ação na Sessão (`SessionRunner.tsx`)**: Na barra superior, botões como "Pausar", "Atividade no tablet" e "Encerrar" sofrem redução de texto no mobile (`.hide-sm`), mas em alguns aparelhos estreitos (320px–360px) os alvos ficam excessivamente próximos, aumentando a chance de toque acidental no botão de encerrar.
3. **Segmented Controls (`Segmented`)**: Em aparelhos móveis menores, os botões das abas segmentadas (Ex.: seleção de modelo ABA/Denver, seleção de ambiente clínica/casa) têm largura adaptativa que pode ficar abaixo de 44px de altura/largura.
4. **Dependência de Hover**: Determinados menus e ações em cartões de casos e gráficos confiam em estados `:hover` para exibir botões secundários (Ex.: botão de excluir rascunho, menu de opções de alvo), tornando-os inacessíveis ou difíceis de acionar em tablets e telas touch sem mouse físico.

### 3.3 Responsividade Multi-Dispositivo
1. **Mobile Pequeno (320px–375px)**:
   - A barra de navegação do caso (`.case-tabs`) possui 9 itens em linha horizontal. Sem scroll-snap ou indicador visual de rolagem, abas como "Família" e "Documentos" ficam ocultas sem sinalização evidente.
   - O modal de criação de caso (`NewCase.tsx`) possui seções em grids que empilham com espaçamentos irregulares em telas estreitas, empurrando os botões de ação para fora da primeira dobra do teclado virtual.
2. **Tablets (768px, 834px, 1024px)**:
   - O Aprumo é utilizado majoritariamente em tablets de consultório (iPad 10.2", Galaxy Tab S6/S8). Telas como o `SessionRunner` dividem alvos à esquerda e tentativa no centro; em tablets verticais (768px), o layout espreme os botões de resposta ("Correta", "Incorreta", "Sem Resposta").
   - A visualização de gráficos clínicos (`TargetChart.tsx` e `CaseData.tsx`) não oferece rolagem tátil fluida para séries longas com mais de 30 sessões em tablet.
3. **Desktop Grande (1440px–1920px)**:
   - Em monitores widescreen, certas páginas de formulário e dashboards esticam o conteúdo horizontalmente além do comprimento confortável de leitura (ideal: 65–75 caracteres por linha), gerando fadiga visual no supervisor.

### 3.4 Desconexão da Homepage com o Restante do Produto
1. **Estrutura Monolítica da Home**: A Landing Page (`Landing.tsx`) acumulava todas as informações do produto em âncoras na mesma página (`#como-funciona`, `#recursos`, `#modelos`, `#seguranca`, `#ciencia`, `#faq`).
2. **Páginas Independentes Ausentes**: Visitantes institucionais, secretarias de educação, clínicas e famílias precisam de páginas públicas dedicadas com URL própria, meta tags, cabeçalho limpo e CTAs direcionados:
   - `/produto`
   - `/profissionais`
   - `/familias`
   - `/criancas`
   - `/adolescentes`
   - `/recursos`
   - `/games`
   - `/como-funciona`
   - `/supervisao`
   - `/dados-metricas`
   - `/seguranca`
   - `/sobre`
   - `/ajuda`
   - `/contato`

---

## 4. Auditoria dos Jogos e Recursos Existentes

### 4.1 Inventário dos 9 Jogos Atuais
1. **`encontre-o-igual`**: Jogo de pareamento de idênticos (matching). Excelente lógica e FLIP animation para a bandeja. Necessita de expansão para o **Match Lab** completo (níveis 2, 3, 4, 6, 8 e 12 estímulos, categorização por cor/forma/função e telemetria expandida).
2. **`escolha-pela-instrucao`**: Repertório de ouvinte (listener). Apresentação com áudio e pistas visuais (luz gradual).
3. **`minha-vez-sua-vez`**: Repertório social de alternância de turnos. Construção compartilhada cooperativa.
4. **`organize-categoria`**: Separação e classificação por classe de estímulos (alimentos, animais, veículos).
5. **`memoria-bichos`**: Memória de trabalho e correspondência com pares encobertos.
6. **`historia-ordem`**: Sequenciação temporal e ordenação narrativa lógica.
7. **`pequeno-chef`**: Manipulação culinária funcional, preparo de receitas e seguimento de passos.
8. **`missao-independencia`**: Atividades de vida diária (AVDs), organização de mochila e rotina prática.
9. **`causa-efeito`**: Intervenção precoce para tolerância a tela e relação ação-reação sensorial.

### 4.2 Lacunas do Game Runtime Unificado
- Embora todos utilizem o `@aprumo/game-sdk`, os jogos utilizavam convenções de eventos levemente distintas para transições de fase.
- Necessidade de formalização do **APRUMO GAME RUNTIME** padronizado, emitindo o ciclo estrito:
  `game_started` → `level_started` → `trial_started` → `stimulus_presented` → `prompt_presented` → `response_started` → `response_recorded` (`correct`/`incorrect`/`no_response`/`self_corrected`) → `reinforcer_presented` → `level_completed` → `game_completed`.

---

## 5. Matriz de Prioridades para o Plano Mestre

| Onda | Foco Estratégico | Entregáveis Principais |
|---|---|---|
| **Wave 0** | **Auditoria & Mapeamento** | `APRUMO_FULL_AUDIT.md`, `APRUMO_IMPLEMENTATION_PLAN.md`, especificações clínicas e de arte |
| **Wave 1** | **Design System, Navegação & Páginas Públicas** | Componentes compartilhados (`BackButton`, `Breadcrumbs`, `CloseButton`), consolidação de tokens, TopBar, Footer, desdobramento das seções da Home em páginas reais com SEO e responsividade |
| **Wave 2** | **Game Runtime, Telemetria & Áudio** | Especificação do runtime universal, eventos padronizados, biblioteca de SFX procedural Web Audio e pipeline de assets |
| **Wave 3** | **Vertical Slice: Match Lab** | Evolução do *Encontre o Igual* para o *Match Lab* com suporte completo a toque, níveis 2–12, telemetria clínica e presets visuais |
| **Wave 4** | **Studio de Recursos Terapêuticos** | Studio de Rotina Visual, Token Board avançado, Task Analysis (Chaining) e Choice Board interoperável |
| **Wave 5** | **Jogos Clínicos Fase 1** | Espelho Mágico, Olha Comigo, Minha Vez / Sua Vez, Missão Instrução |
| **Wave 6** | **Jogos Clínicos Fase 2 & Emoções** | MiniMundos, Detetive das Emoções, Circuito Executivo, Social Stories, Árvore das Emoções |
| **Wave 7** | **Jogos de Autonomia & Vida Diária** | Pequeno Chef, Missão Independência Isométrico |
| **Wave 8** | **Ambiente 3D para Adolescentes** | Social City 3D (Three.js/R3F com lazy loading obrigatório) |
| **Wave 9** | **Co-op Escape Lab** | Escape Lab cooperativo com física Rapier e resolução de quebra-cabeças |
| **Wave 10** | **QA, Acessibilidade & Polimento Final** | Testes automatizados em 5 resoluções críticas, auditoria WCAG 2.2 AA, verificação de desempenho |

---
*Fim do Relatório de Auditoria.*
