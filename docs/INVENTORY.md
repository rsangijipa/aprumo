# Inventário Geral e Reconciliação Técnica — Aprumo v3.0

> Documento gerado automaticamente por `tools/generate-inventory.ts` inspecionando diretamente os arquivos de código-fonte, esquemas SQL e manifestos clínicos.

---

## 1. Resumo Executivo da Plataforma

| Componente | Quantidade Real no Código | Observações |
|---|---|---|
| **Jogos Clínicos Integrados** | **23 jogos** | Todos integrados com `@aprumo/protocol` v2.0 |
| **Migrações Supabase / PostgreSQL** | **18 migrações** | 0001 a 0018 testadas em PostgreSQL via PGlite |
| **Ferramentas Terapêuticas Interativas** | **14 ferramentas** | Prontas para tela, toque e impressão física |
| **Rotas Públicas** | **16 rotas** | Acessíveis a pacientes, famílias e instituições |
| **Rotas da Área Profissional** | **19 rotas** | Painel clínico, supervisão, PEI e telemetria |
| **Rotas de Família e Ambiente Infantil** | **4 rotas** | PWA isolado, seguro e sensorialmente adaptado |
| **Eventos do Protocolo Clínico** | **21 eventos** | Contrato de dados formal com validação Zod |

---

## 2. Catálogo Real de Jogos Clínicos (23)

| # | App ID | Nome do Jogo | Versão | Tipo de Renderização | Motor / Runtime | Toque | Áudio |
|---|---|---|---|---|---|---|---|
| 1 | `bolhas-magicas` | **Bolhas Mágicas** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 2 | `causa-efeito` | **Causa e Efeito** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 3 | `circuito-executivo` | **Circuito Executivo** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 4 | `danca-do-congelar` | **Dança do Congelar** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 5 | `detetive-das-emocoes` | **Detetive das Emoções** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 6 | `encaixa-ai` | **Encaixa Aí** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 7 | `encontre-o-igual` | **Match Lab** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 8 | `escolha-pela-instrucao` | **Missão Instrução** | v2.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 9 | `espelho-magico` | **Espelho Mágico** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 10 | `fazendinha-sonora` | **Fazendinha Sonora** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 11 | `historia-ordem` | **História em Ordem** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 12 | `lanche-do-urso` | **Hora do Lanche do Urso** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 13 | `memoria-bichos` | **Memória dos Bichos** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 14 | `minha-vez-sua-vez` | **Minha Vez, Sua Vez** | v1.1.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 15 | `minimundos` | **MiniMundos** | v1.0.0 | Canvas 2D + DOM | Própria (Canvas 2D loop + @aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 16 | `missao-independencia` | **Missão Independência** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 17 | `olha-comigo` | **Olha Comigo** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 18 | `organize-categoria` | **Organize por Categoria** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 19 | `pequeno-chef` | **Pequeno Chef** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 20 | `rampa-maluca` | **Rampa Maluca** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 21 | `siga-o-mestre` | **Siga o Mestre** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 22 | `social-city` | **Social City 3D** | v1.0.0 | Canvas 2D Pseudo-3D isométrico (Nota: NÃO é 3D real até Three.js) | Própria (Projeção isométrica canvas + @aprumo/game-sdk) | Sim (≥48px) | Web Audio |
| 23 | `tambor-da-imitacao` | **Tambor da Imitação** | v1.0.0 | DOM / SVG vetorial | Compartilhado (@aprumo/game-sdk) | Sim (≥48px) | Web Audio |

> **Nota Arquitetural sobre o `social-city`:** O jogo utiliza projeção isométrica em Canvas 2D de alta fidelidade visual (pseudo-3D). De acordo com a Regra 0, ele **não deve** ser referenciado como 3D real até que um motor Three.js / React Three Fiber seja integrado.

---

## 3. Esquema e Migrações Supabase (18)

| Número | Arquivo SQL | Título Clínico | Propósito Arquitetural |
|---|---|---|---|
| **0001** | `0001_foundation.sql` | **Fundações & Tenancy** | Extensões criptográficas (pgcrypto), estruturas fundamentais multi-tenant, perfis e log de auditoria imutável. |
| **0002** | `0002_cases.sql` | **Gestão de Casos Clínicos** | Cadastro de aprendizes, prontuários, termos de consentimento LGPD e cuidadores. |
| **0003** | `0003_plans.sql` | **Planos Terapêuticos (PEI)** | Programas clínicos, objetivos operacionais, hierarquias de dicas e alvos ABA/Denver. |
| **0004** | `0004_sessions.sql` | **Sessões & Ingestão de Telemetria** | Blocos de execução, registro idempotente de tentativas e fatos brutos de sessão. |
| **0005** | `0005_reinforcers_screen.sql` | **Economia de Reforçadores & Tela** | Cardápio de reforçadores, controle de orçamento de tela e histórico de emparelhamento. |
| **0006** | `0006_projections_alerts.sql` | **Projeções & Regras de Alerta Clínico** | Visões materializadas de desempenho e 15 regras automatizadas de supervisão (R1–R15). |
| **0007** | `0007_family_documents.sql` | **Portal da Família & Documentos** | Comunicações protegidas, relatórios de evolução e anexos clínicos sigilosos. |
| **0008** | `0008_org_defaults.sql` | **Padrões Organizacionais** | Parâmetros padrão de clínica, limites de blocos e hierarquias corporativas. |
| **0009** | `0009_demo_flag.sql` | **Isolamento de Demonstração** | Sinalizadores para dados puramente sintéticos com garantia de não contaminação. |
| **0010** | `0010_plan_versioning.sql` | **Versionamento Imutável de Planos** | Histórico rastreável de revisões de metas com preservação de baseline. |
| **0011** | `0011_child_session_resolve.sql` | **Resolução de Acesso Infantil** | Resolução segura e leve de tokens temporários para o Child Space. |
| **0012** | `0012_session_blocks_runtime.sql` | **Estruturação de Tempo de Execução** | Agendamento de blocos e persistência de estados entre pausas sensoriais. |
| **0013** | `0013_denver_projection.sql` | **Projeções do Modelo Denver (ESDM)** | Agrupamentos cumulativos de marcos por domínio do Modelo Denver. |
| **0014** | `0014_assessment_instruments.sql` | **Instrumentos Padronizados de Avaliação** | Suporte a protocolos de avaliação comportamental e inventários de desenvolvimento. |
| **0015** | `0015_alerts_snooze.sql` | **Gestão & Adiamento de Alertas** | Adiar alertas clínicos com registro mandatório de justificativa técnica. |
| **0016** | `0016_child_space_telemetry.sql` | **Telemetria do Espaço Infantil** | Métricas finas de interação sensorial, engajamento e autorregulação. |
| **0017** | `0017_family_comms.sql` | **Comunicação Bidirecional com a Família** | Troca orientada de feedbacks entre equipe multidisciplinar e responsáveis. |
| **0018** | `0018_admin_security.sql` | **Segurança Administrativa & RBAC** | Permissões granulares de acesso, controle por perfil de usuário e auditoria de segurança. |

---

## 4. Recursos Terapêuticos Interativos & Estúdios (14)

| # | Identificador | Nome do Recurso | Categoria | Evidência Científica | Imprimível |
|---|---|---|---|---|---|
| 1 | `timer-visual` | **Timer Visual Interativo** | Rotina & Visual | Apoio visual baseado em evidências (Wong et al., 2015) | Sim |
| 2 | `primeiro-depois` | **Primeiro → Depois (Premack)** | Comportamento & Fichas | Princípio de Premack & Suportes Visuais ABA (Cooper, Heron & Heward) | Sim |
| 3 | `agenda-visual` | **Agenda de Rotina Diária** | Rotina & Visual | National Clearinghouse on Autism Evidence and Practice (NCAEP) | Sim |
| 4 | `quadro-de-fichas` | **Quadro de Fichas (Economia de Fichas)** | Comportamento & Fichas | Token Economy Systems (Hackenberg, 2009; Cooper et al.) | Sim |
| 5 | `analise-tarefa` | **Análise de Tarefa (Chaining)** | Autonomia & AVDs | Task Analysis and Chaining Procedures in Applied Behavior Analysis | Sim |
| 6 | `historia-social` | **História Social Interativa** | Comunicação & CAA | Social Narratives (Gray, 2010; Wong et al., 2015) | Sim |
| 7 | `prancha-escolha` | **Prancha de Escolha Direta** | Comunicação & CAA | Choice-making interventions in ASD (Shogren et al.) | Sim |
| 8 | `prancha-comunicacao` | **Prancha de Comunicação (PECS/CAA)** | Comunicação & CAA | Picture Exchange Communication System (Frost & Bondy, 2002) | Sim |
| 9 | `arvore-emocoes` | **Árvore das Emoções & Regulação Somática** | Regulação & Sensorial | The Zones of Regulation & Somatic Grounding (Kuypers, 2011; Levine, 2010) | Sim |
| 10 | `semaforo-regulacao` | **Semáforo de Regulação (Zones)** | Regulação & Sensorial | The Zones of Regulation framework (Kuypers, 2011) | Sim |
| 11 | `termometro-emocional` | **Termômetro Emocional de 5 Níveis** | Regulação & Sensorial | The Incredible 5-Point Scale (Buron & Curtis, 2003) | Sim |
| 12 | `rotina-checklist` | **Rotina Visual com Checklist** | Autonomia & AVDs | Visual Schedules & Checklists (Carnahan et al., 2009) | Sim |
| 13 | `contrato-comportamental` | **Contrato Comportamental (ABA)** | Comportamento & Fichas | Behavioral Contracting in Applied Behavior Analysis (Cooper, Heron & Heward) | Sim |
| 14 | `contador-abc` | **Contador de Frequência & Registro ABC** | Comportamento & Fichas | Direct Behavioral Assessment & ABC Contingency Recording (Bijou et al.) | Sim |

---

## 5. Eventos do Protocolo Clínico (`@aprumo/protocol` v2.0.0)

### Eventos Clínicos (Alimentam Gráficos e Projeções)
- `TRIAL_COMPLETED`
- `PROMPT_USED`
- `TOKEN_DELIVERED`
- `BOARD_COMPLETED`
- `SCHEDULE_ITEM_STARTED`
- `SCHEDULE_ITEM_COMPLETED`

### Eventos de Ciclo e Controle
- `SESSION_STARTED`
- `TRIAL_STARTED`
- `REWARD_TRIGGERED`
- `EXCHANGE_STARTED`
- `EXCHANGE_ENDED`
- `SESSION_PAUSED`
- `SESSION_RESUMED`
- `SESSION_COMPLETED`
- `ERROR_OCCURRED`
- `APP_CLOSED`
- `LEVEL_STARTED`
- `LEVEL_COMPLETED`
- `STIMULUS_PRESENTED`
- `RESPONSE_STARTED`
- `REINFORCER_PRESENTED`

---

## 6. Mapeamento de Rotas da Aplicação

### Rotas Públicas (16)
- `/`
- `/entrar`
- `/produto`
- `/profissionais`
- `/familias`
- `/criancas`
- `/adolescentes`
- `/recursos-terapeuticos`
- `/games`
- `/como-funciona`
- `/supervisao-clinica`
- `/dados-metricas`
- `/seguranca-privacidade`
- `/sobre`
- `/ajuda`
- `/contato`

### Rotas Profissionais (`/app` - 19)
- `/app`
- `/app/casos`
- `/app/casos/novo`
- `/app/casos/:caseId`
- `/app/casos/:caseId/plano`
- `/app/casos/:caseId/dados`
- `/app/casos/:caseId/sessoes`
- `/app/casos/:caseId/comportamento`
- `/app/casos/:caseId/reforcadores`
- `/app/casos/:caseId/perfil`
- `/app/casos/:caseId/familia`
- `/app/casos/:caseId/documentos`
- `/app/alertas`
- `/app/recursos`
- `/app/ferramentas/plano-individual`
- `/app/supervisao`
- `/app/equipe`
- `/app/configuracoes`
- `/app/sessao/:sessionId`

### Rotas do Aprendiz e da Família (4)
- `/crianca/:sessionId`
- `/familia`
- `/espaco/:childId`
- `/espaco/:childId/jogar/:appId`
