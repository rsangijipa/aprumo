# PROMPT MESTRE — ESCAPE ROOM KIDS

## PAPEL
Atue como uma equipe sênior de game design de puzzle, engenharia React/TypeScript, React Three Fiber, Three.js, Rapier, UX para crianças e adolescentes, arte 3D, level design, áudio, acessibilidade e QA.

Crie um jogo web 3D independente chamado **Escape Room Kids**.

Faixa:
- versão 6+;
- versão 9+;
- versão 12–15.

O jogo deve ter enigmas visuais, manipulação de objetos, exploração, inferência, memória, sequência e cooperação opcional.

Não usar terror, jumpscare, violência, perseguição ou punições.

A fantasia é “descobrir como a sala funciona”.

---

## FANTASIA
Cada episódio coloca o jogador em um ambiente misterioso, bonito e seguro.

Temas:
- oficina de inventor;
- biblioteca secreta;
- laboratório botânico;
- cabine de trem;
- observatório;
- museu;
- quarto de explorador.

O jogador não está “preso em perigo”.
A narrativa é:
**“Resolva o mistério e abra a saída.”**

---

## STACK
- React;
- TypeScript;
- Vite;
- Three.js;
- @react-three/fiber;
- @react-three/drei;
- @react-three/rapier;
- Zustand;
- XState;
- Howler ou Web Audio;
- GLB/glTF;
- Draco/Meshopt quando necessário.

UI em DOM.
Mundo em Canvas/WebGL.

---

## CÂMERA
Dois modos.

### Modo padrão
Point-and-look / orbit limitado.

Ideal para tablet.

### Modo exploração
Primeira pessoa acessível.

Desktop:
- WASD;
- mouse look.

Mobile:
- joystick esquerdo;
- drag direito para olhar.

Nunca exigir reflexo.

---

## CORE LOOP
**EXPLORAR → OBSERVAR → COLETAR → COMBINAR → INFERIR → TESTAR → DESBLOQUEAR**

---

## SISTEMA DE SALAS
Cada sala contém:
- 5–8 hotspots;
- 2–4 objetos móveis;
- 1–3 cadeados;
- 3–6 pistas;
- 1 puzzle central;
- 1 saída.

Cada puzzle deve possuir mais de uma pista.

---

## NÍVEIS

### Perfil 6+
- formas;
- cores;
- sequência de 3;
- encaixe;
- sombra;
- correspondência;
- causa/efeito.

### Perfil 9+
- códigos;
- pistas combinadas;
- mapas;
- ordem;
- símbolos;
- rotação;
- peso;
- luz.

### Perfil adolescente
- inferência;
- informação parcial;
- circuitos simples;
- lógica;
- múltiplos passos;
- dilemas sem resposta óbvia.

---

## PUZZLES

### 1. Fechadura de Símbolos
Encontrar símbolos no ambiente.

### 2. Caixa de Peso
Colocar objetos corretos em pratos.

### 3. Luz e Espelho
Girar espelhos para guiar feixe.

### 4. Engrenagens
Posicionar engrenagens.

### 5. Sequência Sonora
Reproduzir som.

### 6. Mapa
Relacionar pontos.

### 7. Objetos Combináveis
Chave + cordão; lente + lanterna etc.

### 8. Puzzle Cooperativo
Jogadores veem informações diferentes.

---

## FÍSICA
Usar Rapier.

### Regras
Física apenas onde ela melhora o puzzle.

Objetos:
- dynamic;
- kinematic;
- fixed.

Parâmetros:
- gravidade 9.81;
- restitution baixa;
- friction moderada.

Nunca fazer puzzle depender de física caótica.

### Grab
Raycast.
Objeto preso a anchor virtual.

Limitar:
- distância;
- massa;
- velocidade.

### Snap Zones
Usar sensores.

Quando objeto correto entra:
- magnetismo;
- align;
- lock.

Objeto errado:
- não punir;
- permanece manipulável.

### Gavetas
Prismatic joint ou animação determinística.

### Portas
Hinge joint limitado ou animação.

### Engrenagens
Movimento determinístico, não solver puro.

---

## SISTEMA DE INVENTÁRIO
Máximo 6 slots visíveis.

Itens importantes podem ser:
- examinados;
- girados;
- ampliados;
- combinados.

Modal de inspeção pausa input de câmera.

---

## SISTEMA DE PISTAS
Nunca mostrar solução imediatamente.

Níveis:
1. dica ambiental;
2. dica textual curta;
3. destacar região;
4. mostrar primeiro passo.

Cooldown opcional, sem punição.

---

## STATE MACHINE

```text
BOOT
→ MENU
→ LOAD_ROOM
→ INTRO
→ EXPLORE
   ↔ INSPECT
   ↔ INVENTORY
   ↔ PUZZLE
   ↔ HINT
→ ROOM_SOLVED
→ SUMMARY
```

Cada puzzle possui sua própria máquina.

---

## UI/UX

### HUD
- objetivo pequeno;
- inventário;
- botão dica;
- pausa.

Cobrir < 20% do viewport.

### Desktop
Inventário na base.

### Mobile
Inventário recolhível.

Não colocar cards grandes sobre a cena.

---

## MODAIS

### Inspeção de Objeto
- objeto em 3D;
- girar;
- ampliar;
- combinar.

### Dica
- um texto curto;
- botão próxima dica.

### Pausa
- continuar;
- controles;
- acessibilidade;
- reiniciar puzzle;
- sair.

### Sala Concluída
Mostrar:
- mistério resolvido;
- objetos encontrados;
- enigmas;
- tempo opcional.

Nunca ranking obrigatório.

---

## DIREÇÃO DE ARTE
Estilo:
**Stylized Diorama 3D**.

Características:
- volumes claros;
- material fosco;
- bordas suaves;
- iluminação baked + luzes simples;
- sem realismo pesado;
- cenários com alto contraste funcional.

Cada puzzle deve se destacar do cenário.

---

## ASSETS
Cada episódio:
- sala modular;
- portas;
- gavetas;
- caixas;
- livros;
- objetos;
- mecanismos;
- props;
- iluminação;
- VFX.

Formato GLB.

Regras:
- escala em metros;
- pivô correto;
- colisores separados;
- texturas 1K/2K;
- atlas;
- KTX2 opcional.

---

## ÁUDIO
- room tone;
- clique;
- madeira;
- metal;
- mecanismo;
- sucesso;
- pista.

Áudio espacial opcional.

Sem jumpscare.

---

## ENGAGEMENT
Recompensas:
- chave visual;
- selo de sala;
- objetos colecionáveis;
- diário;
- sala bônus.

Pequenos “aha moments”:
- parede abre;
- globo gira;
- luz revela tinta;
- gaveta secreta;
- constelação aparece.

---

## COOP
Modo opcional.

Jogador A e B podem:
- receber pistas diferentes;
- controlar mecanismos distintos;
- ter inventários separados.

Não exigir chat online aberto.

Comunicação pode ser verbal externa/local.

---

## FRONTEND

```text
src/
  app/
  game/
    scene/
    rooms/
    interaction/
    physics/
    puzzles/
    camera/
  state/
  ui/
    hud/
    inventory/
    modals/
  assets/
  audio/
  save/
  tests/
```

---

## SAVE
Salvar:
- sala atual;
- puzzles resolvidos;
- inventário;
- acessibilidade;
- colecionáveis.

IndexedDB.

---

## ACESSIBILIDADE
- modo point-and-click;
- modo sem movimento livre;
- reduzir camera bob;
- reduzir motion;
- sensibilidade;
- legenda;
- sons visuais;
- cores redundantes por símbolo;
- pistas sem penalidade;
- botão “voltar objeto”.

---

## PERFORMANCE
Meta:
- 60 FPS desktop;
- 30–60 mobile;
- draw calls controladas;
- occlusion simples;
- frustum culling;
- baked lighting;
- GLB lazy-loaded;
- texturas comprimidas.

---

## TESTES
Unit:
- puzzle states;
- inventory;
- combination;
- save.

Physics:
- objetos não atravessam chão;
- grab estável;
- snap determinístico.

Playwright:
- entrar;
- coletar;
- resolver;
- salvar;
- reload.

Visual:
- nenhuma UI bloqueia puzzle.

---

## CRITÉRIOS DE ACEITE
1. Três perfis etários.
2. Pelo menos 3 salas completas.
3. Cada sala com 4+ puzzles.
4. Sistema de pistas em camadas.
5. Inventário.
6. Inspeção 3D.
7. Física estável.
8. Modo acessível point-and-click.
9. Save.
10. Mobile/tablet/desktop.
11. Sem terror.
12. Sem dark patterns.

Entregue código, GLBs placeholder, manifest de assets, licenças, testes e build.
