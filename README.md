# Aprumo

Plataforma clínica para intervenção em **ABA** e no **Modelo Denver**. O alvo do plano individual é a unidade de todos os dados.

- Plano consolidado: [PLANO_IMPLEMENTACAO_APRUMO.md](PLANO_IMPLEMENTACAO_APRUMO.md)
- Brainstorm, pesquisa e design: [docs/BRAINSTORM_DESIGN.md](docs/BRAINSTORM_DESIGN.md)

## Como rodar

```bash
pnpm install
```

```bash
pnpm --filter @aprumo/web dev
```

Abra `http://localhost:5173` e vá em **Entrar**. Há três entradas, todas com dados **fictícios**:

- **Profissional:** painel da supervisora clínica.
- **Família:** portal da responsável pelo Teo.
- **Criança:** o adulto digita o código do cadastro. Códigos de demonstração: `TEO-4821` (4 anos), `DAVI-7094` (7 anos), `BENTO-5530` (13 anos, modo adolescente) e `NINA-2260` (1 ano; o acesso é bloqueado).

Casos do painel:

| Caso | Modelo | O que mostra |
|---|---|---|
| Teo | ABA | Os alertas R1, R2, R3, R5, R6, R8, R10 e R11 |
| Lia | Denver | Os alertas R14 e R15 |
| Davi | ABA | Ensino natural |
| Nina | Denver | Sem portal infantil (menos de 24 meses) |
| Bento | ABA | Espaço no modo adolescente |

## Estrutura

```
apps/web/                      página pública, painel profissional, ambiente da criança (PWA)
  game.html                    página que roda dentro do iframe dos jogos
packages/protocol/             contrato único de dados (eventos v2, manifesto clínico, Zod)
packages/clinical-core/        indicadores, critério de domínio, CDC, regras R1–R15 (TS puro)
packages/game-sdk/             cliente/hospedeiro postMessage, motor de tentativas, áudio, aleatoriedade
packages/offline/              outbox cifrada (IndexedDB + AES-GCM)
packages/ui/                   design system da plataforma (tokens sálvia, componentes, gráfico de alvo)
packages/stimuli/              acervo de estímulos clínicos compartilhado entre jogos e mesa
games/                         23 jogos clínicos integrados (veja docs/INVENTORY.md)
resources/                     recursos de apoio embarcados (agenda-visual, quadro-de-fichas)
apps/web/src/routes/pro/resources/ 14 estúdios terapêuticos interativos e imprimíveis
supabase/migrations/           18 migrações SQL (0001–0018), RLS, triggers de modelo único, ingestão idempotente
supabase/tests/                39 testes do banco em Postgres real (PGlite, sem Docker)
tools/                         ferramentas de automação e geração de inventário
docs/INVENTORY.md              inventário técnico automatizado gerado a partir do código
```

**Regra de design:** cada jogo ou recurso tem tokens, arte, animação e lógica próprios (prefixos `--eoi-`, `--epi-`, `--mv-`, `--qf-`, `--av-`, `--ea-`, `--rm-`, `--lu-`, `--fs-`, etc.). A única coisa idêntica entre eles é o dado que devolvem (`@aprumo/protocol`).

## Testes e Qualidade

```bash
pnpm test       # Roda todos os testes (Postgres real, clinical-core, game-sdk, todos os 23 jogos, recursos e web)
pnpm lint       # ESLint 9 com React Compiler
pnpm typecheck  # TypeScript estrito em todos os pacotes do workspace
pnpm build      # Bundle de produção do PWA com Workbox Service Worker
```

## Estado atual e limites conhecidos

- **23 Jogos Clínicos Integrados.** Todos utilizam o `@aprumo/protocol` v2.0 com touch >=48px, Web Audio e manifesto clínico validado, incluindo os jogos especializados Encaixa Aí, Rampa Maluca, Hora do Lanche do Urso e Fazendinha Sonora. O jogo `social-city` utiliza projeção isométrica em Canvas 2D (pseudo-3D) e não deve ser reportado como 3D real até que um motor Three.js/R3F seja implementado.
- **18 Migrações Supabase (0001–0018).** Validadas em Postgres real via PGlite (39 testes cobrindo isolamento multi-tenant, RLS, regras R1–R15, ingestão idempotente e RBAC administrativo).
- **14 Recursos Terapêuticos Interativos.** Estúdios completos para sessões clínicas e geração de pranchas imprimíveis em alta resolução (Timer Visual, Primeiro-Depois, Agenda, Quadro de Fichas, Análise de Tarefas, Histórias Sociais, Pranchas CAA/PECS, Árvore de Emoções, Semáforo de Regulação, Termômetro de 5 Pontos, Checklist Visual, Contrato Comportamental ABA e Contador ABC).
- **Modo demonstração.** Os dados vivem em memória e passam pela outbox cifrada (IndexedDB + AES-GCM) como em produção. Recarregar a página volta ao estado inicial com dados estritamente sintéticos.
- **Autenticação real.** Login com senha e verificação em duas etapas (TOTP) e envio da outbox estão prontos para conexão via `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- **Inventário Técnico Atualizado.** Para a lista exaustiva de jogos, rotas, eventos e tabelas do banco, consulte [docs/INVENTORY.md](docs/INVENTORY.md).
