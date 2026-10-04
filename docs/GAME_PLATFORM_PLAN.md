# APRUMO — GAME PLATFORM PLAN & RUNTIME ARCHITECTURE

**Versão:** 2.0.0  
**Data:** Outubro de 2026  
**Finalidade:** Arquitetura do Aprumo Game Runtime, Governança Técnica, Engines e Sandbox Isolado.

---

## 1. Visão Arquitetural

Todos os jogos e recursos terapêuticos do Aprumo rodam sob o mesmo modelo de isolamento e governança:
- **Isolamento de Domínio / Iframe Sandbox:** O jogo roda em contexto isolado (`/game.html`), sem acesso direto ao DOM do sistema clínico, cookies de sessão, ou dados do prontuário.
- **Canal de Comunicação PostMessage Criptografado/Validado:** Comunicação bidirecional via canal `aprumo/v2` utilizando o envelope Zod `@aprumo/protocol`.
- **Rigor de Privacidade:** Nenhum jogo recebe nome completo, CPF, dados biométricos, câmera, microfone ou diagnóstico da criança. Apenas apelido de preferência, configuração de alvos, estímulos e parâmetros de adaptação sensorial.

```
┌─────────────────────────────────────────────────────────────┐
│ APRUMO HOST (Web App / SessionRunner / ChildShell)         │
│  - Configuração da sessão clínica                           │
│  - Cálculo de pontuação e critérios de domínio             │
│  - Outbox local criptografada (IndexedDB)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ postMessage ('aprumo/v2')
                           │ Envelopes validados com Zod
┌──────────────────────────▼──────────────────────────────────┐
│ APRUMO GAME RUNTIME (Iframe Guest)                          │
│  - Motor do jogo (React DOM / Phaser / Three.js R3F)       │
│  - Eventos padronizados de telemetria                       │
│  - Feedback sensorial (visual, som procedural suave)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Escolha de Engines por Categoria (Engine Fit)

Em conformidade com a skill `game-development`:

| Categoria | Tecnologia Primária | Casos de Uso | Justificativa |
|---|---|---|---|
| **Recursos e Pranchas 2D Simples** | React 19 + SVG + CSS Tokens | Agendas, Quadros de Fichas, Pranchas de Comunicação, Primeiro/Depois | Máxima clareza tipográfica, acessibilidade DOM nativa, zero bundle de engine externa |
| **Jogos 2D Estruturados & Sondas** | Phaser 3 ou React Animation Layer | Match Lab, Escolha pela Instrução, Minha Vez / Sua Vez, Memória, Sequência | Alta precisão de toque, física 2D leve, partículas controladas e performance em tablets antigos |
| **Jogos de Interação Física 2D** | Phaser + Matter.js | Pequeno Chef | Simulação tátil de líquidos, ingredientes e gravidade com resposta imediata ao toque |
| **Ambientes 3D Imersivos (Adolescentes)** | Three.js + React Three Fiber + Drei + Rapier | Social City 3D, Co-op Escape Lab | Estética contemporânea low-poly madura para adolescentes, iluminação difusa, física de corpos rígidos. **Lazy load obrigatório** (carregado apenas sob demanda). |

---

## 3. O Ciclo de Eventos Universal do Game Runtime

Todo jogo implementado na plataforma emite estritamente os seguintes eventos:

1. **Ciclo de Vida do Jogo:**
   - `game_started`: Inicialização com versão do manifesto.
   - `game_completed`: Conclusão do bloco com tentativas finalizadas.
   - `game_exited`: Saída voluntária ou acionada pelo adulto.
   - `pause`: Suspensão temporária da interação.
   - `resume`: Retorno da sessão após pausa.

2. **Ciclo de Tentativa (Trial Loop):**
   - `level_started` / `level_completed`: Progressão de complexidade (ex.: campo de 2 para 4 estímulos).
   - `trial_started`: Apresentação do estímulo modelo.
   - `stimulus_presented`: Disposição dos alvos na tela com posição registrada.
   - `prompt_presented`: Apresentação de dica (gesto, luz, esvanecimento).
   - `response_started`: Primeiro toque detectado na tela.
   - `response_recorded`: Avaliação da tentativa (`correct`, `incorrect`, `no_response`, `self_corrected`) com latência em ms.
   - `reinforcer_presented` / `reinforcer_selected`: Entrega de reforço ou ficha configurada.

---

## 4. Presets Visuais e Sensoriais

Para atender o perfil sensorial de cada indivíduo (evitando sobrecarga ou infantilização), o runtime aplica os presets:

1. **Faixa Etária / Estilo Visual:**
   - **Soft Clay (2–5 anos):** Formas arredondadas, iluminação de estúdio suave, texturas táteis que remetem a massa de modelar.
   - **Cozy Cartoon (6–9 anos):** Ilustrações planas e acolhedoras com contornos nítidos e legibilidade imediata.
   - **Stylized Realism / Graphic Novel (10–17 anos):** Interfaces limpas, paletas contemporâneas, estética urbana e sem elementos infantis.

2. **Adaptações Sensoriais Configuráveis:**
   - `sensoryMode`: `minimal` (fundo neutro, sem partículas), `normal`, `rich`.
   - `motion`: `static` (zero animações), `reduced`, `normal`.
   - `sound`: `off`, `effects` (sintetizador suave), `full`.
   - `touchScale`: 1x (48px base) a 2x (96px para dificuldades motoras finas).
