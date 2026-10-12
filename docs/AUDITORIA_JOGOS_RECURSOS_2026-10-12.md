# APRUMO — Auditoria técnica, lúdica e terapêutica de jogos e recursos

**Base:** arquivo `aprumo-master(2).zip`, inspecionado em 12/10/2026.  
**Escopo:** fonte do monorepo; 34 manifestos/catálogo, 14 estúdios de recursos, SDK, host/iframe, lógica, estilos, assets, portal infantil e arquitetura.  
**Limite da inspeção:** revisão estática de fontes, sem execução visual em tablets físicos, compilação completa do monorepo ou sessões com usuários reais. Recursos e diagnósticos abaixo distinguem **implementado**, **lacuna observada** e **recomendação**.

## Síntese executiva

A arquitetura já separa o ambiente profissional e os mundos visuais dos jogos, mantém código compartilhado para física elementar, Web Audio, protocolos de eventos e regras de adaptação; há jogos mais sofisticados com Phaser/Canvas, Three.js e narrativas simuladas. O melhor retorno vem de **consolidar a integração clínica, produzir uma camada universal de áudio/narração, fortalecer acessibilidade touch, e aprofundar arte, fases e possibilidades lúdicas de cada produto**. Não se recomenda reconstruir todos os 34 jogos em uma única engine.

### Inventário aferido

- **34 jogos** em seis categorias, com manifestos registrados em `apps/web/src/game-host/registry.ts`.
- **14 estúdios terapêuticos** em `apps/web/src/routes/pro/resources/` (mais dois recursos embarcados em `resources/`).
- **23 dos 34 jogos** possuem referência direta a `useGameClient` ou `createGameClient` em seus fontes; **11 não apresentam essa ligação** e precisam de adaptador clínico antes de ser considerados plenamente integrados.
- 11 sem ligação visível ao SDK: `leitura-de-cena`, `par-perfeito`, `cada-um-no-seu-pote`, `mutirao-do-parque`, `banda-do-tico`, `torre-derruba`, `mercadinho-da-esquina`, `passo-a-passo`, `quadro-de-conquistas`, `escape-room-kids`, `vida-online`.
- A presença de um manifesto contendo nomes de eventos não prova que o jogo os emita. Conferir cada evento por fluxo real e testes de integração.
- O `README.md` raiz informa 23 jogos; o inventário automatizado aponta 34. Atualizar documentação e contadores do site conforme fonte única do catálogo.
- `social-city` apresenta Canvas isométrico, **não** renderização 3D real. Já `escape-room-kids` implementa cena 3D com Three.js/React Three Fiber.

## 1. Diagnóstico priorizado — com referência ao código

| Severidade | Achado | Evidência | Intervenção |
|---|---|---|---|
| Crítica | 11 jogos sem cliente comum de eventos no fonte | `games/**/src/*`, `apps/web/src/game-host/registry.ts` | Adaptador SDK por jogo; não contabilizar resultados clínicos até instrumentar e testar |
| Alta | Catálogo do portal infantil mostrava TODOS os games, sem respeitar idade nem liberação | `apps/web/src/routes/space/ChildSpace.tsx`, antigo `Object.keys(GAMES)` | **Corrigido neste pacote:** filtrar por `releasedApps` + `manifest.clinical.ageRangeMonths` |
| Alta | URL direta para jogo não validava idade e liberação | `apps/web/src/routes/space/PlayShell.tsx` | **Corrigido neste pacote:** mesma verificação na rota |
| Alta | Botão de som do portal não refletia necessariamente a configuração do jogo | `apps/web/src/game-host/config.ts` | **Corrigido neste pacote:** `sound: 'off'` quando o som do espaço estiver desativado |
| Alta | Fala já existe em jogos, mas não há **tutorial narrado universal** e existe uso fixo de `'normal'` | `packages/game-sdk/src/audio.ts`; múltiplos `Game.tsx` | **Parcialmente implementado:** acolhimento narrado pré-jogo para todos, com texto de apoio e respeito ao mute; ainda padronizar fala *dentro* dos jogos |
| Alta | Sem correspondência automática entre “fase do jogo” e programa/classe de desempenho | Manifestos, SDK e jogos independentes | Definir `levelId`, dificuldade, pré-requisito, tentativas, ajuda e domínio por versão |
| Média | O mesmo tap pode significar erro motor, de compreensão ou de atenção | jogos de arrastar/encaixar e tarefas clínicas | Separar resultado cognitivo, qualidade gestual, necessidade de dica e oportunidade de resposta |
| Média | Imagens de capa misturam JPEG, SVG e fallback genérico | `apps/web/src/components/GameIllustration.tsx` | Reestruturar catálogo com capas de arte do próprio jogo, 16:9, corte seguro e download sob demanda |
| Média | Volume, síntese de fala e som usam engines independentes em alguns games | `@aprumo/game-sdk`, `games/**/audio`, Web Speech | Barramento master único, ducking, limite de pico, cancelamento previsível e opção sem som |
| Média | Variabilidade de frameworks dificulta manter UX consistente | DOM/SVG, Phaser, Canvas, Three.js, engines próprias | Padrões mínimos compartilhados por contrato de UI, sem apagar identidades lúdicas |

**Nota clínica:** metas, versões, feedback e dados precisam de validação por profissional. Acerto em um minijogo não demonstra automaticamente domínio funcional ou generalização fora da tela.

## 2. Design system transversal para o ambiente do usuário

**Separar sempre três camadas:** (1) identidade sóbria do Aprumo no painel profissional; (2) mundos próprios para cada jogo; (3) regras compartilhadas de acessibilidade, segurança, qualidade e coleta de dados.

### Interface e composição

- Painel profissional: sálvia, marfim, grafite, terra; tipografia legível editorial, superfícies sólidas, hierarquia clara e pouca animação. **Não usar o estilo infantil na área de prontuários.**
- Capa dos jogos: uma ilustração-signatura com protagonista/objeto central, cenário identificável, título fora da área da ilustração e selo textual de habilidade/faixa etária. Capas do catálogo devem representar o gameplay real.
- Jogo infantil: paleta contextual moderada, fundo com detalhes secundários pouco contrastantes, elemento acionável em primeiro plano, contorno de 2–3px e feedback multissensorial opcional. Limitar transparência em áreas sob texto; sem efeito vidro como superfície padrão. Usar sombra curta só para indicar interação, e não como decoração excessiva.
- Adolescente: visual mais próximo de interfaces de aventura, graphic novel ou simulação cotidiana; evitar personagens infantis, excesso de emoji, confete ou diminutivos. Preferir decisões significativas, consequências reversíveis e escolhas genuínas.
- Estado dos botões: normal, pressionado, selecionado, alvo potencial, desabilitado e foco por teclado. Nunca depender só de cor; adicionar forma, palavra e ícone.
- Proporção das superfícies: paisagem (4:3/16:10) prioritária para mesa com mediador; layout responsivo em retrato sem cortes. Apoiar `100dvh`, `safe-area-inset`, barras do sistema, zoom do navegador e teclado virtual.

### Referências de tamanho por contexto (ponto de partida, não regra rígida)

| Faixa de desenvolvimento / conveniência | Elementos acionáveis sugeridos | Campo visual inicial | Tom e fase |
|---|---:|---:|---|
| 2–5 anos | 80–104 px | 1–3 escolhas | Exploração, causa–efeito e instrução curta |
| 6–9 anos | 64–80 px | 2–5 escolhas | Desafios curtos e variação de regras |
| 10–13 anos | 56–72 px | 3–6 escolhas | Estratégia, sequência e autonomia |
| 14–18 anos | 48–64 px | Dependente da atividade | Narrativas, simulação e tomada de decisão |

Tamanhos são sugestões de UX; determinar por avaliação individual, não por diagnóstico ou idade isoladamente. Alvo preferencial 64px e espaçamento 12–24px no tablet; **sempre** alternativa à precisão de arrasto, alvos com hitbox ampliada e tolerância de soltura. Não confundir tamanho CSS com pixels físicos da tela.

### Tablet e touch — exigências de aceite

1. `Pointer Events` unificados, `setPointerCapture` quando há arrasto, tratamento de `pointercancel`, rejeição de segundo toque involuntário e nenhum duplo clique obrigatório.
2. Movimento por arrastar **ou** selecionar objeto e depois destino; snap progressivo, zona generosa de soltura e retorno gentil em caso de erro.
3. Evitar `touch-action: none` em toda a página: aplicá-lo somente às áreas que capturam gesto, preservando rolagem e zoom em outras regiões.
4. Qualidade em tablets de entrada: cena a 60 FPS quando possível e degradação suave para 30 FPS; `devicePixelRatio` máximo configurável, descarregar texturas e áudio ao sair, pausar animações em background e ao pausar sessão.
5. Respeitar `prefers-reduced-motion`, controles de animação, contraste, som, repetição da narração, subtítulos e luz reduzida. Nenhum flash e evitar sons agudos repentinos.
6. Interface de adulto protegida por gesto deliberado; criança não deve entrar em configurações clínicas acidentalmente. Instruções devem funcionar mesmo sem leitura autônoma.
7. Testar em iPad Safari, Android Chrome, retrato/paisagem, 3:2/4:3/16:10, tela dividida, modo offline, perfis sensoriais e acessibilidade de sistema.

## 3. Fases, progressão e avaliação clínica

**Modelo comum proposto:** acolhimento → demonstração opcional → exploração guiada → 3 a 5 mundos/mecânicas → desafio de generalização → encerramento com devolutiva adequada à idade. É possível começar e parar em qualquer fase; nunca punir com perda arbitrária de pontos.

- **Nível de aprendizagem** ≠ **nível de dificuldade visual**: guardar ambos. Ex.: seguir instrução com três itens não é necessariamente mais difícil que discriminar relações espaciais.
- Criar `LevelDefinition` com `id`, `world`, `objectiveId`, `ageGuidance`, `prerequisites`, `stimulusSet`, `fieldSize`, `timePolicy`, `inputMode`, `promptHierarchy`, `masteryPolicy`, `visualTheme`, `introNarration`, `successNarration`.
- Ajustar a progressão a respostas independentes, com dicas e não respostas **separadamente**; não subir por toques corretos após dica; escada adaptativa clínica configurável e decisão de supervisor.
- Para cada tentativa: registrar estímulo, alvo, resposta, latência desde estímulo, tempo de movimento, nível/tipo/origem de dica, condição sensorial, variante da mecânica e versão de fase. Não inferir emoção, atenção visual ou autocontrole a partir de latência isolada.
- Diversificar de forma controlada posições e estímulos (aleatoriedade com semente), permitir treino sem pontuação e opção de generalização com cenários fotográficos reais devidamente licenciados.
- Oferecer três modos transversais: **exploração livre**, **prática acompanhada**, **sessão terapêutica instrumentada**; resultados do modo livre não entram como dado clínico de domínio.

## 4. Revisão e ampliação — 34 jogos, individualmente

As faixas abaixo seguem **os manifestos atuais** (não equivalem a indicação clínica validada). Uma faixa é elegibilidade de UX; habilidades e apoio dependem de avaliação individual.

### A. Comunicação e linguagem

| Jogo e faixa do manifesto | UI, arte, mecânica, fases e evolução proposta |
|---|---|
| **Bolhas Mágicas** (1–5 a) | Arco visual do sopro, bolhas translúcidas sem prejudicar legibilidade, partículas leves e sombras em tempo real só quando permitidas. Mundos: tocar → escolher bolhas → solicitar continuidade → turnos com adulto. Refatorar física com arrasto do vento/colisões e usar “pedido funcional” sem exigir fala oral; aceitar CAA, gestos ou olhar funcional observável. |
| **Missão Instrução** (3–12 a) | Palco claro com figuras maiores, direção espacial inequívoca e botão de repetir áudio. Fases: uma ação → duas etapas → três etapas → conceitos espaciais e qualificadores; evitar distratores semânticos ambíguos. Adicionar indicação visual discreta de qual instrução está ativa. |
| **Fazendinha Sonora** (1–4 a) | Livro-pop-up com cenas de fazenda, páginas animadas em baixa intensidade e animais consistentes; alternar narração, exploração tátil e turnos. Fases: tocar e ouvir → identificar animal → antecipar som → história colaborativa. Proteger níveis de volume e permitir sons gravados licenciados ou procedurais de qualidade. |
| **Leitura de Cena** (4–12 a) | Ampliação por regiões da cena, zoom sem perder contexto, personagens com diversidade de corpos e formas de comunicação. Fases: descrever o observável → encontrar pistas → formular hipóteses → discutir versões alternativas; registrar justificativa opcional por gravação somente com consentimento. Incluir legenda e narração das cenas. **Pendente integrar protocolo clínico.** |

### B. Cognição, pareamento e classificação

| Jogo e faixa do manifesto | UI, arte, mecânica, fases e evolução proposta |
|---|---|
| **Match Lab / Encontre o Igual** (2–18 a) | Refinar mesa de feltro, recortes, sombras e bordas dos cartões; oferecer trocas entre ilustração vetorial e fotos. Fases: idêntico → cor/forma → associações funcionais → múltiplos exemplares; contrabalancear posição e permitir campo menor que o atual por adaptação. Prioridade: confiabilidade de dado por condição e dica. |
| **Encaixa Aí** (2–8 a) | Peças 3D estilizadas ou pseudo-3D isométricas com espessura, sombra de contato e animação de encaixe suave. Fases: uma peça → orientação → mais peças → encaixe por sequências. Substituir hitbox estreita por snap amplo, comando selecionar-depois-colocar, e simular colisão sem exigir precisão fina. |
| **Organize por Categoria** (3–10 a) | Lixeiras/prateleiras com identidade visual própria; trajetória de objetos com arco e mola física leve. Fases: cor → forma → função → categoria contextual → múltiplos critérios. Sinalizar categoria em palavra, pictograma e textura; desacelerar a esteira nos modos acessíveis. |
| **Memória dos Bichos** (3–9 a) | Cards com relevo sutil e verso contrastado, 12 bichos com traços consistentes; animação de flip reduzível. Fases: 2 → 3 → 4 → 6 pares e atraso variável, incluindo associação sonora opcional. Exibir pistas de progresso sem distrair da memória; nunca deixar timer obrigatório. |
| **Par Perfeito** (2–8 a) | Consolidar o objetivo de pareamento idêntico como **modo clínico** do Match Lab; manter identidade visual temática como mundo alternativo se tiver valor. Melhorar alvo de arrasto e reversão de erros, oferecer modo de cartões físicos. **Pendente integração SDK**; evitar duplicidade de motor e indicadores. |
| **Cada Um no Seu Pote** (2–9 a) | Potes expressivos e materiais táteis diferenciados, objetos com massa/bounce visual discreto, encaixe por proximidade; níveis cor → forma → objeto → funcionalidade → regra reversa. Alternativa por toque; telemetria motora não deve alterar julgamento cognitivo. **Pendente integrar SDK.** |

### C. Social e emocional

| Jogo e faixa do manifesto | UI, arte, mecânica, fases e evolução proposta |
|---|---|
| **Detetive das Emoções** (6–16 a) | Transformar pistas em painéis de HQ com expressões/contextos culturalmente diversos, múltiplas hipóteses e variáveis de situação. Fases: reconhecer pistas → combinar pistas → comparar interpretações → nomear estratégias de apoio. Corrigir feedback excessivamente categórico: emoção não é inferível com certeza por rosto isolado. |
| **Olha Comigo** (2–7 a) | Cenários com foco compartilhado, apontamentos e sinais de atenção multimodais; objetos com pequenas reações sem estímulos excessivos. Fases: alternar foco → seguir direção/apontar → compartilhar interesse → iniciar convite. **Não exigir contato ocular.** |
| **Minha Vez, Sua Vez** (3–10 a) | Torre e bastão de turnos mais visíveis, cronômetro opcional e interação cooperativa adulto-criança no mesmo tablet. Mundos: blocos, aquário, trem, cozinha. Fases: 2 turnos → 4 turnos → esperar sem bloquear todo o jogo → planejar estratégia conjunta. |
| **Social City** (12–18 a) | Preservar simulação urbana em Canvas isométrico; não anunciar como 3D até migrar para renderização tridimensional. Expandir para transporte, escola, entrevistas, amizades, pedidos de ajuda, limites pessoais e consentimento. Rotas ramificadas com escolhas legítimas, histórico de decisões e diálogos narrados com legendas. |
| **Mutirão do Parque** (5–13 a) | Phaser com mapas interativos, objetos maiores e tarefas com impacto visual persistente; microfísica de pegar/coletar/cooperar. Fases: tarefa própria → coordenação de equipe → negociação de recursos → missão colaborativa sem “resposta social única”. **Integrar SDK e medir contribuição sem premiar submissão social.** |

### D. Imitação, ritmo e música

| Jogo e faixa do manifesto | UI, arte, mecânica, fases e evolução proposta |
|---|---|
| **Espelho Mágico** (2–8 a) | Personagem articulado com animações fluidas, opção de vídeo demonstrativo licenciado, modos sentado e mobilidade reduzida. Fases: gesto isolado → dois gestos → alternância → imitação criativa; avaliação motora feita pelo profissional, não por simples toque. |
| **Tambor da Imitação** (1–6 a) | Superfície do tambor com áreas de resposta grandes, vibração/squash moderados e animação do Tico coerente com áudio. Fases: um pulso → dois → sequências → completar ritmo; alternativa visual às pistas sonoras e controles de volume. |
| **Siga o Mestre** (3–10 a) | Criar cartões multimodais de “mandou/não mandou”, mudanças de personagem e missões curtas. Fases: ações simples → inibir distração → alternar regra → generalização para jogos físicos; opção de latência ampliada. Substituir voz fixada em `'normal'` pela configuração sensorial. |
| **Dança do Congelar** (2–8 a) | Animação corporal de baixo estímulo, cenas progressivas (jardim/palco/cosmos), pista visual quando o som é desligado. Fases: parar → continuar → alternar sinais → mudança de regra. Usar avaliação presencial do movimento e não presumir “congelou” apenas por ausência de toque. |
| **Banda do Tico** (4–13 a) | Refinar instrumentos, materialidade, animações por impacto, mixagem com limiter e baixa latência. Fases: exploração → eco de ritmos → criar arranjo → executar com parceiro. Interface com pulsos visuais e *one-shot* por toque; **integrar ao SDK para registro e pausa clínica**. |

### E. Rotina, exploração e brincar

| Jogo e faixa do manifesto | UI, arte, mecânica, fases e evolução proposta |
|---|---|
| **Rampa Maluca** (1,5–5 a) | Rampas modulares com gravidade, velocidade, atrito e pequenas colisões estáveis; veículos com tamanhos consistentes e previsíveis. Fases: soltar → escolher → prever resultado → construção com adulto. Evitar cinemática que “teletransporte” após frame longo. |
| **Lanche do Urso** (1,5–5 a) | Urso expressivo sem excesso de estímulo, pratos, utensílios e objetos com pontos de encaixe; estados de fome, sede, sono e cuidado visualmente legíveis. Fases: uma ação → sequência curta → cuidado alternativo → narrativa livre; sem impor contato alimentar real. |
| **MiniMundos** (3–11 a) | Mundos de casa, escola, mercado e consultório com arte consistente e cenários acessíveis; adicionar “modo brincar livre”, câmera sem perseguição, inventário simplificado e propriedades físicas leves só onde agregam causalidade. Salvar estado opcional e permitir histórias criadas pela criança. |
| **Torre Derruba** (1–5 a) | Materiais de madeira/papelão, sombra de contato realista mas leve, amortecimento consistente e limites físicos claros. Fases: empilhar → estabilizar → derrubar → construir em dupla; separar assistências de pegada de desempenho de planejamento. **SDK pendente.** |
| **Causa e Efeito** (1–6 a) | Jardim com objetos altamente acionáveis e consequências imediatas. Fases: tocar → pressionar/soltar → arrastar → acionar sequência → antecipar evento; feedback sensorial configurável com zero flash, sem cronômetro compulsório. |

### F. Funções executivas e autonomia

| Jogo e faixa do manifesto | UI, arte, mecânica, fases e evolução proposta |
|---|---|
| **Circuito Executivo** (7–16 a) | Robô Bip com HUD estável entre as três estações existentes (Go/No-Go, troca de regra, memória visual). Fases dentro de cada estação: aprendizagem da regra → desafio → alternância → aplicação cotidiana. Recalibrar velocidade pela resposta *motora* e registrar omissão, falso alarme e dica de modo distinto. |
| **Missão Independência** (4–16 a) | Mapas escolares/domésticos com etapas arrastáveis e contexto coerente; escolhas que trazem consequências instrutivas e reversíveis. Mundos: mochila → autocuidado → compras → deslocamento seguro → planejamento semanal. Tarefas simuladas devem resultar em sugestões para prática real com mediador. |
| **Pequeno Chef** (2,5–12 a) | Cozinha rica em detalhes funcionais, ingredientes reconhecíveis, cortes seguros e mecânicas de misturar, medir e ordenar. Fases: dois ingredientes → receitas simples → planejamento → substituições e higiene. Controles alternativos ao arrasto e nenhuma exigência de provar alimento. |
| **História em Ordem** (3,5–10 a) | Ilustrações com continuidade de personagens, iluminação e planos; cartas maiores e organização por toque ou arrasto. Fases: 3 → 4 → 5 quadros → narrativas alternativas; aceitar mais de uma sequência causal plausível quando aplicável. |
| **Mercadinho da Esquina** (6–16 a) | Supermercado com navegação por seções, lista visual, carrinho com massa apenas decorativa e notas/moedas brasileiras legíveis. Fases: encontrar itens → orçamento → comparar preços → troco → decisão diante de imprevistos. **SDK pendente; cuidado com arredondamento monetário (centavos inteiros).** |
| **Passo a Passo** (3–16 a) | Checklist encadeado com fotos/pictogramas, vídeos curtos legendados, botão de retroceder e feedback para cada etapa. Fases: tarefa total → encadeamento direto/reverso → fading de ajuda → uso no ambiente real. **SDK pendente; separar passos realizados e passos apenas simulados.** |
| **Quadro de Conquistas** (3–16 a) | Cartões com reforçadores escolhidos em conjunto, metas visíveis, pictogramas editáveis e etapa de troca clara. Fases: pactuação → fichas conquistadas → troca → revisão da meta. **SDK pendente; nunca remover conquistas como punição.** Considerar sua fusão com o recurso `quadro-de-fichas` para evitar fontes de verdade distintas. |
| **Escape Room Kids** (7–16 a) | Three.js já empregado: otimizar GPU, materiais e texturas em tablets; ampliar hitboxes 3D e apresentar interação em modal 2D acessível. Salas Oficina, Biblioteca, Estufa já descritas no README; acrescentar modos cooperativos, criação de desafios e trilhas por idade. **SDK pendente; fallback Canvas/2D para aparelhos sem WebGL.** |
| **Vida Online** (10–18 a) | Simulação de smartphone e redes sociais com UX mais adolescente, legendas, narrador opcional e cenários que contemplem privacidade, cyberbullying, consentimento, golpes e verificação de fontes. Fases: reconhecer risco → comparar escolhas → dialogar/pedir apoio → transferir estratégia para situações fictícias novas. **SDK pendente; nunca pedir credenciais reais.** |

## 5. Recursos terapêuticos — 14 estúdios

| Estúdio existente | Melhorias de interface, uso clínico e no tablet |
|---|---|
| Timer Visual | Presets personalizáveis, leitura de tempo por voz opcional, círculo e barras, aviso previsível não aversivo, pausa/resume sem drift de relógio; modo tela cheia infantil. |
| Primeiro → Depois | Cartões grande formato, pictogramas consistentes, narração de cada item, arrastar para reordenar ou selecionar por toque e exportação para imprimir. |
| Agenda Visual | Rotinas por ambiente, transições com áudio, indicação de concluído, repetição programada, cartões visuais editáveis e sincronização com plano autorizado. |
| Quadro de Fichas | Motor único com Quadro de Conquistas; fichas, metas, tempo do reforçador e mudança de tema por interesse, com permissões de edição de adulto. |
| Análise de Tarefa | Encadeamento para frente/trás, níveis de ajuda, avaliação por etapa, checklist responsivo e exportação clara. |
| História Social | Criador de roteiro com cenas, balões, áudio narrado, múltiplos personagens e linguagem neutra; evitar promessas de respostas sociais rígidas. |
| Prancha de Escolha | Cartões 2–6, cenários com fotos/pictogramas, “escolhi” por voz sem coleta desnecessária de áudio, layouts editáveis. |
| Comunicação CAA/PECS | Símbolos + labels, voz sintetizada pt-BR, frases compostas e vocabulário central/pessoal; não equiparar toda CAA ao PECS formal. |
| Árvore de Emoções | Foco em nomeação, localização corporal, hipóteses e escolhas de estratégia; jamais inferir emoção automaticamente. |
| Semáforo de Regulação | Personalizar cores e textos, permitir estados não lineares, mostrar recursos de pausa e solicitar ajuda. |
| Termômetro Emocional | Escolha de intensidade por ícone, número e voz; escalas adaptáveis, sem medir “perigo” a partir de autorrelato isolado. |
| Rotina Visual + Checklist | Atividade doméstica/escolar, duração opcional, acessibilidade touch e modo papel/painel. |
| Contrato Comportamental | Metas colaborativas, critérios observáveis, prazo de revisão, envolvimento da família e histórico de versões; não como instrumento punitivo. |
| Contador ABC | Fluxo em dois toques para frequência/duração e contexto; offline/undo, distinção antecedente-comportamento-consequência e exportação com rastreabilidade. |

**Oportunidades de consolidação:** `quadro-de-conquistas` + Quadro de Fichas (mesmo mecanismo e metas, variantes lúdicas); `passo-a-passo` + estúdio Análise de Tarefa (configuração profissional versus execução pela criança); `historia-social` + `leitura-de-cena` (editor de roteiro e modo de interpretação podem compartilhar assets, mas manter objetivos diferentes). Não fundir indiscriminadamente `Match Lab` com `Par Perfeito` sem preservar a lógica clínica de cada modalidade.

## 6. Áudio narrado, lúdico e acessível

### Camada implementada nesta revisão

Novos arquivos: `apps/web/src/game-host/narration.ts`, `apps/web/src/game-host/intro.css`; alteração de `apps/web/src/game-host/game-main.tsx`. Roteiros **individuais para os 34 jogos** com missão, instrução, orientação reservada ao mediador e controle de reprodução antes do início. A tela abre com texto sempre visível, botão `Ouvir como jogar`, `Parar leitura`, `Começar a jogar`. A reprodução só ocorre após toque, seguindo limitações de navegadores; se `sound=off` o botão fica desativado. O jogo só é montado após tocar em começar, evitando que o tempo ouvindo a explicação contamine a latência da primeira tentativa.

**Ainda necessário para solução plena:** narração durante fases para games especializados, coordenação de suas engines sonoras, escolha de voz pt-BR por plataforma, fallback quando nenhuma voz estiver instalada, gravações humanas de qualidade opcionais, seleção da velocidade e reapresentação contextual no HUD de cada jogo. O Web Speech depende das vozes instaladas no navegador e não deve ser anunciado como narração humana de estúdio.

### Roteiro de falas por fase

`boasVindas`: título e missão (até 8 segundos)  
`comando`: uma frase por mecânica (idealmente 5–12 palavras)  
`repete`: repetir só a instrução corrente; sem interromper arbitrariamente outra ação  
`dica1..n`: mais objetiva a cada pedido, com telemetria de nível de ajuda  
`feedback`: discreto, descritivo e não julgador (“Você colocou a peça no espaço”)  
`transicao`: antecipar mudança de regra  
`encerramento`: valorizar processo e oferecer escolha de continuar ou parar  

**Exemplos**: “O Tico vai tocar. Escute! Quando chegar sua vez, faça o ritmo.”; “Temos três pistas. Qual você quer explorar primeiro?”; “Você pode pedir uma dica ou experimentar outro caminho.”

### API sonora ideal

`NarrationService` com prioridades (segurança > instrução > dica > reforço > ambiente), cancelamento ao mudar de fase, `AbortSignal`, captions sincronizadas, cache local opcional de áudio licenciado, suporte a pt-BR, volume independente de música, redução automática da música durante a voz (*ducking*) e telemetria de `narrationPlayed/replayed/skipped` **sem gravar voz da criança**. Respeitar configurações do perfil e não criar fala automática no carregamento que falhe em Safari.

## 7. Física e engenharia visual

- **DOM/SVG:** ideal para atividades de discriminação, leitura e escolha; não force engine 3D. Usar animações CSS e SVG com transform/GPU moderado e persistência de hitboxes acessíveis.
- **Canvas 2D:** usar loop com `delta time` limitado, execução com `requestAnimationFrame`, *fixed timestep* nos jogos que dependem de colisões e desligamento quando a aba fica oculta. O SDK já traz física vetorial básica; expandir somente após testes de determinismo e necessidades reais.
- **Phaser:** normalizar escalonamento ao espaço de jogo, `pointerdown/move/up/cancel`, densidade de tela e descarte completo de cenas e instâncias ao desmontar.
- **Three.js:** usar renderização sob demanda quando pausado, qualidade adaptativa, atlas de textura, compressão de assets, `raycast` com alvos maiores que o mesh, fallback em 2D e sem controle exclusivamente por hover.
- **Sensação tátil:** não depender de vibração, indisponível em vários tablets; expressar contato por deformação leve, som suave e resposta visual clara.
- **Acessibilidade de física:** oferecer precisão normal/assistida, snap magnetizado, tolerância configurável, velocidade do mundo, colisão assistida e modo com objeto estático. Fases de treino não devem usar erros de precisão motora como substituto de erro cognitivo.

## 8. Arquitetura e qualidade da integração

**Padrão de implementação de uma atividade integrada**:

```
Catálogo / elegibilidade clínica
    ↓
Tela introdutória com texto, voz e orientação do adulto
    ↓
Game SDK: APP_READY → SESSION_CONFIG
    ↓
Jogo carrega fase conforme metas/idade/perfil sensorial
    ↓
TRIAL_STARTED / STIMULUS_PRESENTED / RESPONSE_STARTED
    ↓
PROMPT_USED (se houver) → TRIAL_COMPLETED
    ↓
LEVEL_COMPLETED / SESSION_COMPLETED
    ↓
Host valida e persiste eventos com ACK e versão
```

Os 11 jogos independentes precisam de **adapters específicos**; não se deve inventar tentativas ou transformar visitas/clicks automaticamente em acertos clínicos. Para games narrativos, definir claramente qual decisão é uma oportunidade de treino e exigir aprovação de mapeamento do profissional.

### Contratos mínimos por jogo

- `manifest` validado e idêntico ao jogo executado; `supportedInputs`, `supportedViewports`, `minTouchTarget`, `narration`, `phases`, `assets`, `needsWebGL`, `usesClientTelemetry`.
- Troca de estado via eventos de SDK, sem dependência de armazenamento global de outro jogo.
- Tela de entrada consistente com a estrutura clínica, mas sem sobrepor a arte de jogo.
- Sem URL que contorne restrição etária e liberação; validação no servidor também obrigatória em produção — o filtro frontend é apenas UX.
- Controles de adulto e integração com `screenBudgetSec`, pausas e reconexão offline.
- Resiliência para Web Speech indisponível, Canvas context lost, WebGL desativado, queda de energia e atualização do service worker.

### Testes e métricas

1. Unitários: estados, escada de dificuldade, aleatoriedade, colisor/gravidade, prompt, pontuação e dinheiro em centavos.
2. Contrato: cada jogo envia `APP_READY`, recebe config, gera eventos tipados, respeita pausa e encerra de modo idempotente.
3. Acessibilidade automatizada e manual: WCAG, foco, labels, leitor de tela, leitura por voz, alternativa a arrasto e toques únicos.
4. Dispositivos: iPad Safari, Chrome Android, tablet fraco, Chrome Windows touch, orientação dinâmica, som bloqueado/offline.
5. Performance: FPS p50/p95, uso de memória, desenho/dropped frames, entrada até feedback (INP), tamanho de assets e latência de carga.
6. Segurança: escopo multi-tenant, permissão de sessão, expiração de tokens, RLS, LGPD infantil, consentimento e separação entre treino e atendimento.
7. Validação clínica com profissionais e sessões supervisionadas; não alegar eficácia clínica por testes de código.

## 9. Oito novos jogos sugeridos

1. **Loja do Bairro** (6–13 anos): pedido, lista, troco e comunicação de ajuda em diferentes situações; integrar com Mercadinho sem duplicar base monetária.
2. **Oficina do Tico** (3–10): encaixes, causa-efeito e planejamento em oficina 2D com objetos de física assistida.
3. **Cadê o Erro?** (7–16): identificar inconsistências em cenas e explicar hipótese; feedback aceita mais de uma justificativa.
4. **O Que Vem Depois?** (4–12): sequência temporal, antecipação e inferência, em módulo compartilhado com História em Ordem.
5. **Construtores em Dupla** (4–14): construção cooperativa por turnos e negociação de papéis, em modo tablet compartilhado.
6. **Mapa das Escolhas** (10–18): narrativa de autonomia, limites pessoais, conflitos e opções de pedir ajuda, sem moralização rígida.
7. **Missão Sinal Verde** (6–14): deslocamento seguro, reconhecimento de sinalização e tomada de decisão em travessias simuladas (não substitui supervisão real).
8. **Laboratório de Estratégias** (8–18): testar estratégias de regulação e planejamento, com preferência individual e reflexão aberta; não tratar uma estratégia como universal.

## 10. Roadmap recomendado

**P0 — Segurança, consistência e voz:** fechar filtro de idade/liberação, respeitar som do perfil, trazer introduções narradas; testar Safari/Android; instrumentar 11 games independentes ou marcá-los como não clínicos na interface profissional até integração.

**P1 — Touch, acessibilidade e identidade:** tokens transversais de hitbox/borda/contraste, controle sensorial em todos os jogos, áudio central com fallback, refinamento de capas e 3 jogos-piloto (Encaixa Aí, Circuito Executivo, Vida Online).

**P2 — Fases clínicas e física:** motores de progressão por habilidade, novos mundos, cenas 2D/3D com perfis de performance, adaptação por plano terapêutico e relatório por nível.

**P3 — Escala:** editor de roteiros/fases para profissionais, biblioteca de assets, modos colaborativos, generalização para situações naturais e testes com usuários e dispositivos.

## 11. Checklist de entrega para implementação por agente de código

- [ ] 34 roteiros individuais localizados em pt-BR, sempre texto + voz opcional.
- [ ] Intro não registra `TRIAL_STARTED`; somente iniciar jogo quando usuário selecionar `Começar`.
- [ ] Todas as 34 atividades elegíveis por idade real e efetivamente liberadas; rota também verifica.
- [ ] Todos os 34 jogos com integração SDK **real**, eventos completos onde clinicamente aplicável.
- [ ] Perfil sensorial respeitado por todos os engines, inclusive áudio próprio.
- [ ] Interações touch acessíveis no iPad/Android; sem hover e sem drag obrigatório.
- [ ] Fases verificadas, progresso separado por condição, métricas independentes de resposta motora.
- [ ] Capas e ilustrações consistentes com gameplay, usando assets leves e responsivos.
- [ ] Feedback sem punição, sem efeito estroboscópico e com reduzido movimento.
- [ ] Testes de versão de nível, offline, event ACK, cancelamento TTS, viewport e segurança.
- [ ] Plano individual define alvos, dicas e avaliação; modo livre não vira automaticamente dado clínico.
- [ ] Guia de mediação e documentação atualizados (34 jogos).

## 12. Prompt de implementação detalhado para Vibe Coding

> Você está trabalhando no monorepo Aprumo (React 19, TypeScript, Vite, pacote `@aprumo/game-sdk`, contrato `@aprumo/protocol`, recursos profissionais e jogos em `games/`). Faça uma refatoração **incremental e testada**, mantendo código existente, seus jogos e sua identidade visual.
>
> **Objetivo:** tornar as 34 atividades e 14 estúdios acessíveis, táteis, narrados em pt-BR, adequados à faixa etária e ao perfil sensorial, e clinicamente integrados. Nunca assuma que um manifesto é prova de telemetria implementada.
>
> **Primeira etapa:** audite `registry.ts`, os 34 manifestos, `game-main.tsx`, `PlayShell.tsx`, `ChildSpace.tsx`, `config.ts`, `audio.ts`, as implementações dos jogos e os 14 estúdios. Reconcilie inventário e recursos. Abra issues por achado com critérios verificáveis. Reaproveite as adições de `narration.ts`, `intro.css` e o fluxo de intro desta revisão.
>
> **Segunda etapa:** produza uma camada de narração compartilhada com roteiro por jogo e por fase, Web Speech pt-BR acionado por gesto, legenda e texto persistentes, repetição, cancelamento, volume de voz separado de música, fallback e prioridade de áudio. Não cole um narrador flutuante por cima do tabuleiro; prepare o jogador antes da primeira tentativa e ofereça um botão discreto de ouvir novamente durante a fase. Teste Safari iPad e Chrome Android.
>
> **Terceira etapa:** implemente adaptadores de protocolo para os 11 jogos sem cliente SDK identificados no relatório. Em cada um, registre apenas oportunidades clinicamente válidas, alinhadas ao manifesto e aprovadas pelo profissional, com eventos `TRIAL_STARTED`, `STIMULUS_PRESENTED`, `PROMPT_USED` quando couber, `TRIAL_COMPLETED`, `LEVEL_*`, `SESSION_*`. Teste ACK, idempotência, pause/resume e event sequencing. Não gere dados clínicos falsos para clique de navegação.
>
> **Quarta etapa:** para cada um dos 34 jogos, faça documento curto com estado atual, objetivo terapêutico, público etário, fluxo, telas, assets, lógica, eventos, pontos de falha e backlog de melhorias. Siga a Seção 4 deste relatório. Implemente em lotes pequenos: primeiro Encaixa Aí + Circuito Executivo + Vida Online; só então estenda padrões aos demais. Não substitua Phaser/Three.js/Canvas por uma engine única sem necessidade demonstrada.
>
> **Quinta etapa:** adicione modos `exploração livre`, `prática mediada`, `sessão clínica`, e um motor de fases tipado com versão, requisitos, alvo clínico, adaptação, dicas, resultado, aceitação de entrada touch, dados de nível e progresso. Separe sucesso terapêutico da precisão motora e da velocidade de resposta. Registre prompts embutidos separadamente de ajuda humana.
>
> **Sexta etapa:** evolua design e ilustrações de cada jogo: arte própria de personagens/ambientes/objetos consistente entre cenas, atenção à leitura visual, telas por fase e responsive para 4:3, 16:10 e retrato, sem textos sobre áreas transparentes ruidosas. Manter uma identidade de plataforma sóbria e mundos de jogos distintos. Crianças pequenas: alvos e imagens grandes, baixa densidade; adolescentes: linguagem e visual não infantilizados. Crie padrões de botões, feedback, HUD, captação de ponteiro e redução de movimento.
>
> **Sétima etapa:** refine física com `fixed timestep` quando necessário, snapping acessível, hitboxes amplas, desempenho adaptativo, pausa real e limpeza dos recursos. Teste toque, multi-touch, arrastar + alternativa de tocar e depois posicionar, pointercancel, WebGL fallback, perda de contexto, tela dividida e zoom.
>
> **Oitava etapa:** nos 14 estúdios, refine acessibilidade e impressão, implemente leitura de cartões, conteúdo editável e versionamento; una `quadro-de-conquistas` com Quadro de Fichas e `passo-a-passo` com Análise de Tarefas por lógica compartilhada, preservando vistas de criança/profissional distintas. Adicione controles por mediador sem exposição de prontuário.
>
> **Qualidade:** sem regressões no portal clínico; testes unitários e E2E em todos os fluxos; verificação de segurança multi-tenant; validação manual de tablet; registrar métricas de FPS, memória, INP e tamanho do bundle. Entregar PRs por domínio, screenshots de telas e relatórios de testes reais. Não afirmar que foi testado onde não houve execução. Não prometer eficácia clínica; exigir revisão de profissional para regras de ensino e de reforço.

---

**Estado desta entrega:** narração **pré-jogo** individual de 34 atividades, filtro etário/liberação na interface do espaço infantil e alinhamento do `sound` no treino livre implementados em código-fonte. As demais melhorias, especialmente **fases profundas, ilustrações adicionais, adaptação de 11 SDKs e física refinada**, constam como plano e ainda não foram implementadas. Código compilado/execução visual não verificados neste ambiente.
