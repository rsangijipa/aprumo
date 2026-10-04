# Aprumo — Plano Único de Implementação

Consolidação de `PsicoPlay_Especificacao_Plataforma_Clinica_2026.docx` (**Doc A**) e `Especificacao_Plataforma_v1.docx` (**Doc B**). Nome do produto: **Aprumo** (substitui "PsicoPlay" em tudo: pacotes, UI, docs).

## 1. Como os documentos se relacionam

Os dois partem dos mesmos repositórios de referência (PsicoPlayKids e Terapia-Arcade) e concordam no essencial: backend Postgres/Supabase com RLS, `clinical_events` append-only e idempotente, pontuação e agregação no servidor, jogo como recurso e não como terapeuta, portal infantil sem ranking, LGPD/ECA Digital, WCAG 2.2 AA, IA só assistiva.

Diferenças e a decisão tomada para cada uma:

| Tema | Doc A | Doc B | Decisão para o Aprumo |
|---|---|---|---|
| Ponto de partida | Evoluir o monorepo existente | Construir do zero, repos só como referência | **Do zero** (a pasta está vazia; os repos não estão disponíveis). Herdar padrões, não código. |
| Modelo de intervenção | ABA, NDBI e ESDM podem coexistir ("engine NDBI" genérica) | **Um modelo por caso: ABA ou Denver, nunca híbrido**, imposto no banco | **B.** Campo `model` imutável no plano, triggers de rejeição, transição só por `transition_case_model`. A "engine NDBI" do Doc A vira o modo Denver (rotinas de atividade conjunta). |
| Unidade de dado | Objetivo/skill/target com ontologia | **Alvo do plano** (`target_id` obrigatório; sem alvo = só telemetria lúdica) | **B**, com a ontologia de skills do Doc A como catálogo de `repertoire`/domínio versionado (fase posterior). |
| Domínio | `mastery_rules` versionadas | `mastery_criteria` + regras R1–R15 + CDC | **B** (mais completo); manter versionamento de critério do Doc A (alterar critério não reescreve histórico). |
| Tempo de tela | Não trata | SBP 2024: sem portal infantil < 24 meses, medidor diário, regra R13 | **B.** |
| Triagem pública / instrumentos adultos / ranking | Remover ranking; registro de instrumentos com licença | Remover os três; sem PHQ-9/ASRS/AQ-10/CBI/WHO-5 | **Remover os três; manter o registro de instrumentos do Doc A** (licença, SATEPSI, uso permitido) para escores lançados. |
| Retenção | "por categoria", sem prazo | Prontuário 20 anos (Lei 13.787), registro 5 anos | **B** (20 anos, exclusão bloqueada com justificativa). |
| Perfis | RBAC+ABAC por papel | Papel **por caso** (`case_team_members`), admin sem acesso clínico | **B**; `has_case_role(case_id, roles[])`. |
| Offline | EventQueue + ACK | Outbox única cifrada no host; SDK não mantém fila própria | **B** (corrige a perda de tentativas, lacuna L3). |
| Incidentes/IA/FHIR | Resolução ANPD 15/2024, AI Gateway, mapeamento FHIR | IA com 3 usos permitidos e 3 vetados | **Somar:** runbook de incidentes do A; restrições de IA do B; AI Gateway e FHIR ficam em S9/pós-MVP. |
| Direção visual | Marfim `#FAF9F6`, verde `#5C8D89`, terracota `#D68C71` | Tokens em 3 camadas (profissional teal `#1B5E63`, infantil calmo/vívido), Plus Jakarta + Fredoka + Atkinson | **B**, que já absorve a paleta do Arcade em `child.calm`/`child.vivid`. |
| Stack | Supabase/Postgres, sa-east-1 | Abordagem A: PWA React+TS + Postgres gerenciado, região Brasil | **Igual.** React 19 + Vite + TS, Supabase (sa-east-1). |

Itens exclusivos do A que entram: inventário de instrumentos/licenças, RIPD antes do piloto, runbook de incidentes, release gates clínicos, rotinas de atividade conjunta, mapeamento FHIR, matriz de dados por classe de sensibilidade.
Itens exclusivos do B que entram: tudo de ABA/Denver operacional (fases do alvo, hierarquias de dica, CDC, R1–R15), economia de fichas, prancha de comunicação (Open Board), perfil sensorial, portal da família, fidelidade e IOA, página inicial pública e telas de acesso.

## 2. Princípios inegociáveis (viram critérios de aceite)

P1 modelo único por caso · P2 alvo é a unidade · P3 jogo é recurso, motor sugere e humano decide · P4 só é "domínio" o que cumpre critério do alvo · P5 tela proporcional à idade · P6 privacidade desde a concepção · P7 sem engajamento predatório (sem ranking, caixa-surpresa, streak punitivo, notificação à criança) · P8 generalização como meta.

O sistema **nunca** calcula: média de percentuais de alvos diferentes, "desempenho geral", nota de sessão, comparação entre crianças, ranking.

## 3. Stack e estrutura

- **Front:** React 19, TypeScript, Vite, React Router, TanStack Query, Zod, PWA (`vite-plugin-pwa`/Workbox), `idb` para IndexedDB, Web Crypto para a outbox.
- **Back:** Supabase (Postgres + Auth + Storage + Edge Functions), região `sa-east-1`. Migrações SQL, RLS em toda tabela, testes pgTAP.
- **UI:** CSS com tokens (3 camadas), `<dialog>` nativo, gráficos próprios em SVG com tabela alternativa; fontes via Fontsource.
- **Qualidade:** Vitest, Testing Library, Playwright + axe, ESLint, Prettier, Turbo.
- **Regras clínicas:** código puro TS em `packages/clinical-core`, sem dependência de UI nem banco, 100% testado com fixtures aprovadas pela supervisão; roda no aparelho e no servidor. CDC, regressão e teste binomial implementados internamente (sem libs estatísticas).

```
aprumo/
  apps/web/                 página pública, profissional, família, criança (rotas por perfil, lazy)
  packages/clinical-core/   critérios, R1–R15, indicadores, CDC
  packages/protocol/        envelope v2, manifesto clínico, JSON Schemas (Zod)
  packages/game-sdk/        SDK dos jogos (config, eventos, adaptação, pausa, ACK)
  packages/ui/              tokens, componentes, gráficos acessíveis
  packages/offline/         outbox cifrada, sync, cache
  games/<id>/               um módulo isolado por jogo, com manifesto e esquemas
  db/migrations/ db/tests/  esquema, RLS, triggers, pgTAP
  docs/                     spec viva; catálogo e status gerados no CI
```

## 4. Fases de implementação

Ordem por dependência (Doc B §13) com o roadmap de fases do Doc A mapeado. Nada clínico antes da fundação de segurança; nenhum jogo antes do alvo.

### S0 — Fundação e conformidade (M)
Monorepo, CI (lint, tipos, testes, audit de dependências, SBOM), tokens e componentes base, página inicial pública (sem triagem), telas de acesso (login, MFA, recuperação, seleção de organização), `organizations`, `organization_memberships`, `case_team_members`, `consents` versionados, `audit_log` (leitura e escrita), RIPD inicial, inventário de instrumentos e licenças.
**Aceite:** testes de isolamento entre organizações e entre casos passando; página inicial e acesso aprovados em revisão axe + manual.

### S1 — Núcleo clínico (G)
`children`, `cases`, anamnese, `record_addenda`, `case_timeline_events`; `intervention_plans` (model imutável); ABA: `plan_goals`, `programs`, `targets`, `target_phases`; Denver: `denver_cycles/objectives/steps`; bibliotecas (`prompt_hierarchies/levels`, `mastery_criteria`, `stimulus_sets/stimuli`, `behavior_definitions`, `program_templates`); funções `change_target_phase` e `transition_case_model`.
**Aceite:** supervisor monta um plano ABA e um Denver completos; o banco rejeita registros incompatíveis com o modelo; alterar critério não muda a leitura de sessões antigas.

### S2 — Aplicação de sessão (G)
`sessions`, `session_blocks`, `trial_records`, `opportunity_records`, `chain_step_records`, `denver_routine_records`, `denver_step_scores`, `behavior_events`, `session_notes`; telas de aplicação ABA (DTT/NET/cadeia/comportamento) e Denver (rotina + amostragem a cada 15 min); outbox cifrada; RPC `ingest_records` idempotente; quarentena; nota clínica obrigatória para fechar sessão.
**Aceite:** sessão inteira em modo avião sincronizada sem perda; registrar tentativa em até 2 toques; retry da mesma tentativa não duplica contagem.

### S3 — Análise e decisão (M)
Projeções `fact_*`, `target_status`, `decision_alerts`; gráficos de alvo e comportamento (linhas de fase, independente vs. com dica, distribuição de dicas, eventos de contexto); CDC; regras R1–R15; painel do supervisor.
**Aceite:** resultados idênticos aos conjuntos de referência; alertas aparecem após a sincronização; toda régua mostra regra, versão e leva aos eventos de origem.

> **Marco: piloto clínico** (S0–S3, casos selecionados, consentimento, supervisão próxima). Gate: RIPD concluído, teste de restore, plano de incidentes.

### S4 — Reforçadores e portal infantil (M)
Inventário, MSWO/pareado/livre (MSWO digital bloqueado sem sonda de pré-requisito), economia de fichas, tela como reforçador temporizada, `screen_time_ledger`, portal por faixa etária e perfil sensorial (sem portal < 24 meses), protocolo v2 e `game-sdk` com `EVENT_ACK`, `ActivityFrame` com sandbox/origem/token escopado.

### S5 — Primeiros jogos (M)
Seis conceitos reconstruídos sobre o manifesto clínico: Encontre o Igual, Escolha pela Instrução, Organize Categoria, Minha Vez/Sua Vez, Pequeno Chef, Me Mostra. Sete etapas de publicação (Doc B §9.8); taxa de quarentena > 1% bloqueia versão.

### S6 — Família e documentos (M)
Portal do responsável (sem notas internas), tarefas de generalização, orientação, validação social, documentos conforme Res. CFP 06/2019 (versão imutável, PDF/Word).

### S7 — Supervisão e fidelidade (M)
Checklists derivados do programa, observação, IOA, competências, horas de supervisão.

### S8 — Catálogo ampliado e comunicação (G)
Demais jogos (25 conceitos), novos recursos, prancha de comunicação (Open Board/OBF, símbolos Mulberry por padrão), materiais imprimíveis, acessibilidade avançada e switch scanning.

### S9 — Adolescentes, IA assistiva e interoperabilidade (M)
Jogos 12+, AI Gateway server-side com provenance e confirmação humana (somente os 3 usos permitidos), exportação FHIR e estudo de elegibilidade RNDS.

## 5. Release gates (valem desde S0)

- Nenhuma tabela com dado sensível sem RLS, grants explícitos e teste de acesso cruzado em CI.
- Nenhum valor exibido como "domínio" sem regra/versão visíveis e teste de referência.
- Nenhum jogo no catálogo sem manifesto clínico validado, dono, versão e mapeamento de repertório.
- Nenhum instrumento em produção sem revisão de licença, população e enquadramento (SATEPSI quando teste psicológico).
- Nenhum relatório final com eventos offline pendentes sem exceção registrada.
- IA nunca escreve no registro clínico sem confirmação humana.
- Jogo nunca recebe nome completo, diagnóstico ou notas clínicas.
- Nenhuma tela compara crianças; nenhum jogo é chamado de "teste psicológico", "QI" ou diagnóstico.

## 6. Primeiro corte executável (depois da pausa para Opus)

1. Scaffold do monorepo e CI; tokens e componentes base em `packages/ui`.
2. `db/migrations`: organizações, vínculos, consentimentos, audit_log + RLS + pgTAP de isolamento.
3. `packages/clinical-core`: critério de domínio, % independente, nível médio de dica, regressão, CDC, com fixtures.
4. `packages/protocol`: envelope v2, manifesto clínico, esquemas de `TRIAL_COMPLETED`.
5. Página inicial e telas de acesso.
6. Núcleo do plano (S1) com triggers de modelo único.

## 7. Decisões pendentes (bloqueiam partes, não o início)

Modelo de negócio (define Mulberry vs. ARASAAC); licença da Lista de Verificação do ESDM e currículos (sem licença: só estrutura e escores); validação clínica dos padrões (90%/2 sessões/10 oportunidades, parâmetros R1–R15, intervalo de 15 min Denver); política de foto e vídeo de crianças; se a família atua como coterapeuta; controlador/operador por modelo comercial; fornecedores de IA/observabilidade; teleatendimento dentro ou fora da plataforma.

## 8. Ambiente e riscos de execução

- `docker` **não está instalado** nesta máquina: `supabase start` e os testes pgTAP locais precisam dele (ou de um projeto Supabase remoto de dev, sem dados reais). Instalar Docker Desktop antes de S0.2.
- Escopo grande: seguir o marco de piloto após S3 e não antecipar S4+.
- Risco principal de adoção: registrar mais devagar que o papel. Medir tempo por tentativa desde S2.

## 9. Status (04/10/2026)

| Item | Status |
|---|---|
| Back-end: migrações 0001–0004 (organizações, casos, plano ABA/Denver, sessões, registros, eventos, sessão infantil) com RLS | Feito · 13 testes em Postgres (PGlite) |
| `clinical-core`: indicadores, critério de domínio, CDC, R1–R15, política de tela | Feito · 14 testes |
| Protocolo v2 + SDK (cliente/hospedeiro, motor de tentativas, ACK) + outbox cifrada | Feito · 5 testes |
| Página principal, telas de acesso, painel profissional (início, casos, plano, dados, sessões, alertas, recursos) | Feito |
| Aplicação de sessão ABA (2 toques, atalhos, ABC, reforçadores) e Denver (rotinas, intervalos) | Feito |
| Ambiente da criança (tablet, iframe, canto do adulto, tempo de tela) | Feito |
| Jogos: Encontre o Igual, Escolha pela Instrução, Minha Vez/Sua Vez; Quadro de Fichas, Agenda Visual | Feito · 8 testes de lógica |
| Banco: reforçadores, MSWO com pré-requisito, fichas, livro de tela, projeções (`fact_*`), alertas com decisão justificada, família e documentos (0005–0007) | Feito · +10 testes em Postgres |
| Portal da família (progresso acessível, tarefas de casa, orientações, documentos, validação social) | Feito |
| Documentos (dados do período + análise, versão final com registro no conselho e hash, impressão/PDF) | Feito |
| Lint (ESLint 9 + hooks + jsx-a11y) e CI (lint, typecheck, testes, build, audit) | Feito |
| Login real com senha + TOTP e envio da outbox para o Supabase | Pronto no código · **falta testar contra um projeto Supabase real** |
| Novo caso (assistente), editor de plano ABA e Denver, reforçadores com MSWO, comportamento com plano de manejo, perfil sensorial e pré-requisitos | Feito |
| Supervisão: fidelidade derivada do procedimento, concordância entre observadores, horas, competências; equipe e configurações | Feito |
| Celular e toque: navegação inferior, janelas como painel inferior, sessão com respostas fixas, ambiente infantil em retrato | Feito |
| Espaço da criança/adolescente (entrada por código, jogos liberados, estrelas de esforço, álbum, prancha de comunicação, cantinho da calma) | Feito |
| Supabase real e retirada dos dados fictícios; mais jogos (S8); IA assistiva (S9); Playwright | Próximas etapas |
