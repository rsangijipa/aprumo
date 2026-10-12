# PROMPT MESTRE — BANDA DO TICO

## PAPEL
Atue como uma equipe formada por game designer musical, engenheiro de áudio web, especialista em Phaser, TypeScript, Web Audio, UX infantil, animação 2D, acessibilidade e QA.

Crie um jogo web musical independente chamado **Banda do Tico**.

Faixa principal: **5 a 11 anos**.
Modo avançado: até 13 anos.

O objetivo é criar um jogo que seja divertido mesmo sem finalidade educativa explícita e que, ao mesmo tempo, treine:
- imitação;
- ritmo;
- atenção;
- memória auditiva;
- coordenação;
- turnos;
- cooperação;
- criatividade;
- antecipação;
- controle inibitório.

Não copiar músicas, personagens ou UI de franquias conhecidas.

---

## FANTASIA
Tico é o maestro de uma banda de personagens originais.

Palcos:
- quintal;
- praça;
- garagem;
- escola;
- floresta;
- barco;
- festival.

A música começa simples e cresce conforme o jogador participa.

O reforço principal não deve ser uma tela de prêmio.
O reforço deve ser **a própria música ficando melhor**.

---

## PILARES
1. latência mínima;
2. resposta audiovisual imediata;
3. música nunca para por erro;
4. experimentação;
5. criação;
6. progressão por instrumentos;
7. cooperação;
8. acessibilidade de timing.

---

## MODOS

### 1. Brinca Som
Sandbox musical.

Sem acerto/erro.

Instrumentos grandes.

### 2. Faz Igual
Tico toca.
Jogador repete.

### 3. Eco Musical
Uma sequência é tocada e some.
Jogador reproduz.

### 4. Complete o Compasso
Música toca com um espaço vazio.

### 5. Crie Seu Beat
Sequenciador visual.

### 6. Banda Junto
Jogador controla uma camada da música.

### 7. Dueto
Dois jogadores controlam instrumentos complementares.

### 8. Maestro
Jogador decide quando cada instrumento entra e sai.

---

## CORE LOOP
**OUVIR → ANTECIPAR → TOCAR → FEEDBACK → FRASE COMPLETA → MÚSICA CRESCE**

Não interromper o fluxo.

---

## ENGINE
- Phaser;
- TypeScript;
- Vite;
- Web Audio API;
- Howler opcional apenas para sons não sincronizados.

O tempo musical deve ser controlado por `AudioContext.currentTime`.

Nunca usar `setTimeout` como relógio musical principal.

---

## MOTOR MUSICAL

```ts
interface Transport {
  bpm: number
  currentBeat: number
  currentBar: number
  start(): void
  pause(): void
  seek(beat: number): void
}

interface NoteEvent {
  beat: number
  instrumentId: string
  velocity: number
  duration?: number
}
```

Implementar scheduler look-ahead.

Sugestão:
- lookAhead: 25 ms;
- scheduleAheadTime: 0.1 s.

---

## JANELAS DE TIMING

Padrão:
- Perfect: ±90ms;
- Good: ±180ms;
- Late/Early: fora disso.

Acessível:
- Perfect: ±160ms;
- Good: ±300ms.

Para crianças pequenas:
não exibir “MISS”.

Mostrar:
- estrela suave;
- onda;
- personagem continuando.

---

## PROGRESSÃO

### Fase 1
1 instrumento.
Batida livre.

### Fase 2
1–2 toques.

### Fase 3
Sequências.

### Fase 4
Ritmo com pausa.

### Fase 5
Dois instrumentos.

### Fase 6
Memória.

### Fase 7
Cooperação.

### Fase 8
Criação.

### Fase 9
Performance.

---

## COMBOS
Combos devem acrescentar elementos musicais.

Exemplo:
- 4 beats → shaker;
- 8 beats → baixo;
- 12 beats → público;
- 16 beats → luzes.

Perder combo:
- remove gradualmente camada;
- nunca interrompe música;
- nunca usa som negativo.

---

## “DOPAMINA” SAUDÁVEL
Produzir prazer por:
- som instantâneo;
- sincronização;
- bounce;
- ondas;
- dança;
- luzes;
- camadas musicais;
- desbloqueios;
- criação;
- replay.

Não usar:
- loot boxes;
- streak;
- energia;
- anúncios;
- reward wheel;
- prêmio aleatório pago.

---

## INSTRUMENTOS
Mínimo:
1. tambor;
2. pandeiro;
3. chocalho;
4. palmas;
5. triângulo;
6. agogô;
7. xilofone;
8. bloco sonoro;
9. bumbo;
10. caixa;
11. prato;
12. teclado.

Cada instrumento:
- 2–4 samples;
- sprite;
- animação;
- hit area;
- cor;
- ícone.

---

## FÍSICA
A física nunca controla o timing musical.

Phaser Arcade ou Matter pode ser usado somente para:
- confete;
- bolas musicais;
- objetos de cenário;
- baquetas decorativas.

Toda resposta rítmica deve ser baseada no relógio de áudio.

---

## VISUALIZAÇÃO DE RITMO

Três modos:

### Modo pulso
Instrumento cresce no beat.

### Modo trilha
Notas vêm em direção à zona de toque.

### Modo pictograma
Sequência de ícones.

O usuário pode escolher.

---

## UI/UX

```text
┌────────────────────────────────────────────────────┐
│ ←       BANDA DO TICO                   🔊 ⚙ ⏸    │
│                                                    │
│               PALCO + BANDA                       │
│                                                    │
│             linha / pulso musical                  │
│                                                    │
│ [TAMBOR] [PALMAS] [CHOCALHO] [BLOCO]              │
└────────────────────────────────────────────────────┘
```

Centro livre.

HUD pequeno.

---

## MOBILE
- instrumentos em 2x2;
- swipe para trocar banco;
- sem elementos pequenos;
- latência monitorada.

---

## MODAIS

### Configuração de Áudio
- música;
- instrumento;
- efeitos;
- voz;
- latência;
- calibrar toque.

### Calibração
Criar teste simples:
- usuário toca junto com 8 beats;
- medir offset médio;
- aplicar correção local.

### Biblioteca Musical
- músicas;
- beats criados;
- instrumentos.

### Fim de Performance
Mostrar:
- música criada;
- instrumentos usados;
- replay;
- remix;
- salvar.

Sem nota escolar.

---

## DIREÇÃO DE ARTE
Estilo: **Paper Cut Concert + Soft 2.5D**.

Paleta:
- azul noite #283B5B
- coral #E96A5F
- amarelo #F3C24F
- verde #63A675
- lilás #8A79C7
- creme #FFF8E8

Personagens:
- silhuetas claras;
- expressão corporal;
- animação ligada ao BPM.

---

## ANIMAÇÃO
Cada personagem:
- idle;
- anticipation;
- hit;
- recovery;
- comemoração;
- dança.

Sincronizar via beat.

---

## ÁUDIO

Estrutura:
```text
audio/
  kits/
  music/
  ui/
  ambience/
```

Criar limiter master.

Evitar clipping.

Lazy-load de kits.

---

## SEQUENCIADOR

Grid:
- 8 passos para pequeno;
- 16 passos para avançado.

Funções:
- adicionar;
- remover;
- mute;
- solo;
- duplicar;
- limpar;
- BPM;
- play;
- stop;
- salvar.

---

## DADOS

```ts
type RhythmAttempt = {
  patternId: string
  expectedBeat: number
  actualTime: number
  deltaMs: number
  judgement: "perfect"|"good"|"other"
  instrumentId: string
}
```

Dados devem ficar locais.

---

## FRONTEND

```text
src/
  audio/
    transport.ts
    scheduler.ts
    mixer.ts
    latency.ts
  game/
    scenes/
    characters/
    fx/
  rhythm/
    patterns/
    scoring/
  composer/
  ui/
  data/
  save/
  tests/
```

---

## ACESSIBILIDADE
- timing ampliado;
- modo sem julgamento;
- modo visual sem som;
- modo sonoro com visual reduzido;
- reduced motion;
- contraste;
- tamanho de pad;
- volume individual;
- repetir padrão;
- velocidade 60–140 BPM.

---

## PERFORMANCE
- áudio prioritário;
- não criar GC durante beat;
- pool de FX;
- preload de samples atuais;
- manter input < 1 frame;
- 60 FPS desejado.

---

## TESTES
Testar:
- scheduler;
- BPM;
- pausa;
- resume;
- offset;
- quantização;
- save;
- mobile latency.

Playwright:
- abrir;
- calibrar;
- tocar;
- criar beat;
- salvar;
- recarregar.

---

## CRITÉRIOS DE ACEITE
1. Música nunca para por erro.
2. Input audível quase instantâneo.
3. Existe sandbox.
4. Existe imitação.
5. Existe criação.
6. Existe cooperação.
7. Calibração funciona.
8. 12 instrumentos.
9. Ao menos 30 padrões.
10. Offline após cache.
11. Mobile/tablet/desktop.
12. Sem dark patterns.

Entregue projeto completo, build, samples legalmente utilizáveis, manifest, licenças, testes e README.
