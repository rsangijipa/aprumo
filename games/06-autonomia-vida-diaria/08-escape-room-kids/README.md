# 🗝️ Escape Room Kids — Mistérios e Descobertas 3D

Um jogo web 3D independente de mistério, exploração e raciocínio lógico desenvolvido para crianças e jovens, com foco em segurança emocional (sem sustos, violência ou punições) e fantasia de "descobrir como a sala funciona".

---

## 🛠️ Stack Tecnológica

- **Framework**: React 18 + TypeScript + Vite
- **3D & Renderização**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Gerenciamento de Estado**: Zustand
- **Design System & Estilo**: Claymorphism (UI/UX Pro Max), Google Fonts (`Baloo 2` e `Fredoka`), Vanilla CSS modular com tokens
- **Áudio**: Web Audio API (Síntese sonora procedural de room tone, cliques, engrenagens, sinos afinados e fanfarra)
- **Persistência**: IndexedDB com fallback automático para LocalStorage
- **Efeitos de Celebração**: `canvas-confetti`
- **Ícones**: Lucide React (SVGs vetoriais acessíveis, sem emojis em botões)
- **Testes**: Vitest

---

## 🎯 Perfis Etários

1. **6+ Anos**: Enigmas focados em cores, formas, correspondência e causa e efeito.
2. **9+ Anos**: Códigos visuais, rotação de mecanismos, balança de pesos e mapas estelares.
3. **12–15 Anos**: Circuitos, dedução lógica, espectro cromático e múltiplos passos.

---

## 🏰 As 3 Salas e Seus Enigmas

### 1. Oficina do Inventor (Inventor's Workshop)
- **Tema**: Engrenagens de latão, cristais energéticos e tubulações de vapor.
- **Enigma 1**: *Cadeado Rúnico do Baú* — Alinhar as ferramentas do inventor (Martelo, Engrenagem, Chave Inglesa). Recompensa: **Engrenagem de Bronze**.
- **Enigma 2**: *Mural de Engrenagens do Gerador* — Acoplar a Engrenagem de Bronze aos eixos para acionar o dínamo e o gerador de cristal.
- **Enigma 3**: *Prisma e Feixe de Luz do Cristal* — Girar dois pedestais com espelhos para guiar o feixe laser até o sensor solar da saída. Recompensa: **Mola Relojoeira**.
- **Enigma 4**: *Montagem da Chave Mestra* — Inspecionar em 3D a **Chave Incompleta** e combiná-la com a **Mola Relojoeira** para criar a **Chave Mecânica Mestra** que abre a porta blindada.

### 2. Biblioteca Secreta (Secret Library)
- **Tema**: Tomos arcanos, constelações, sinos afinados e passagens secretas.
- **Enigma 1**: *Atril dos Quatro Tomos Encantados* — Reordenar os livros na ordem dos elementos (Fogo Vermelho, Água Azul, Terra Verde, Sol Amarelo). Recompensa: **Disco de Astrolábio**.
- **Enigma 2**: *Globo Celeste & Constelação* — Encaixar o disco e girar o anel celestial até alinhar a constelação da Fênix. Recompensa: **Lupa dos Arcanos**.
- **Enigma 3**: *Sinfonia dos Quatro Sinos* — Tocar a melodia harmoniosa dos sinos (Dó ➔ Sol ➔ Mi ➔ Lá). Recompensa: **Fragmento de Pergaminho**.
- **Enigma 4**: *Decifrar Código Secreto* — Combinar a Lupa com o Pergaminho em 3D para revelar as runas da passagem secreta na estante.

### 3. Laboratório Botânico (Botanical Greenhouse)
- **Tema**: Estufa de vidro, flora bioluminescente, balança antiga e irrigação hidropônica.
- **Enigma 1**: *Balança das Sementes Mágicas* — Equilibrar os pratos da balança (1 Bolota Solar de 3kg = 1 Fruta de Cristal de 2kg + 1 Semente de Lua de 1kg). Recompensa: **Lente Prismática Solar**.
- **Enigma 2**: *Circuito de Válvulas de Água* — Girar 4 registros de cobre para alinhar o fluxo de água até a raiz do canteiro. Recompensa: **Bulbo Dourado**.
- **Enigma 3**: *Filtro Solar Cromático* — Combinar a luz solar amarela com o filtro azul para produzir o feixe verde-esmeralda da fotossíntese.
- **Enigma 4**: *Chave Floral de Âmbar* — Colher o Pólen Lunar na árvore e combiná-lo com o Bulbo Dourado para criar a Chave Floral que abre o portão do conservatório.

---

## 💡 Sistema de Pistas em 4 Camadas

- **Nível 1**: Observação no ambiente (nudge sutil).
- **Nível 2**: Pista textual direcionada.
- **Nível 3**: Destaque 3D no diorama (objeto ou ponto de interesse pulsa em dourado na cena).
- **Nível 4**: Revelação explícita do primeiro passo.
- *Sem punições, sem perda de pontos ou pressão de tempo.*

---

## 🎮 Controles

- **Modo Point-and-Look (Órbita)**: Botão esquerdo do mouse / toque para girar a visão do diorama. Clique nos pontos interativos para focar e abrir enigmas.
- **Modo Exploração (1ª Pessoa)**: Teclas `W`, `A`, `S`, `D` ou Setas para caminhar; arraste do mouse para olhar em volta.
- **Alternar Câmera**: Botão no topo direito do HUD ou menu de configurações.

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev

# Rodar suíte de testes unitários
npm test

# Gerar build de produção
npm run build
```
