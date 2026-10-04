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
games/encontre-o-igual/        mundo "mesa de feltro" (pareamento)
games/escolha-pela-instrucao/  mundo "palco" (resposta de ouvinte)
games/minha-vez-sua-vez/       mundo "tapete e torre" (troca de turnos)
resources/quadro-de-fichas/    economia de fichas
resources/agenda-visual/       varal de cartões / primeiro–depois
supabase/migrations/           esquema, RLS, triggers de modelo único, ingestão idempotente
supabase/tests/                testes do banco em Postgres real (PGlite, sem Docker)
```

**Regra de design:** cada jogo ou recurso tem tokens, arte, animação e lógica próprios (prefixos `--eoi-`, `--epi-`, `--mv-`, `--qf-`, `--av-`). A única coisa idêntica entre eles é o dado que devolvem (`@aprumo/protocol`).

## Testes

```bash
pnpm test
```

```bash
pnpm lint
```

O comando cobre o banco (isolamento, modelo único, imutabilidade e idempotência), as regras clínicas, o motor de tentativas e a lógica de cada jogo.

## Estado atual e limites conhecidos

- **Modo demonstração.** Os dados vivem em memória (nunca em `localStorage`) e passam pela outbox cifrada como em produção. Recarregar a página volta ao estado inicial.
- **Autenticação real.** Login com senha e verificação em duas etapas (TOTP) e envio da outbox estão prontos. Ativam com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (veja `apps/web/.env.example`), mas ainda não foram testados contra um projeto real.
- **Migrações 0001–0007.** Validadas em Postgres via PGlite (23 testes); falta aplicá-las num projeto Supabase.
- **Demonstração:** em `/entrar`, "Ver o portal da família" mostra a visão da responsável pelo Teo.
- **Fora desta etapa:** supervisão e fidelidade, IA generativa, agenda e faturamento.
- **Playwright.** Fica para o final, como combinado.
