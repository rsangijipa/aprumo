# Especificações de Jogos Terapêuticos & GDDs — Aprumo

Este diretório contém os Game Design Documents (GDD), repertórios comportamentais-alvo e regras de integração com o `@aprumo/protocol` para todos os 9 jogos terapêuticos do Aprumo:

---

## 1. Encontre o Igual (`encontre-o-igual`)
- **Repertório:** Pareamento de Idênticos (Matching-to-Sample).
- **Modelo:** ABA (trial-based).
- **Core Loop:** Apresentação de modelo na bandeja e campo de 1 a 4 cartões sobre o feltro. Toque no idêntico voa até o encaixe com confirmação auditiva e registro de latência.
- **Acomodação:** Posições contrabalanceadas (nunca 3× seguidas no mesmo slot), escala tátil adaptativa.

## 2. Escolha pela Instrução (`escolha-pela-instrucao`)
- **Repertório:** Comportamento de Ouvinte (Listener Responding / Receptivo).
- **Modelo:** ABA (trial-based) e Denver (joint-routine).
- **Core Loop:** Voz sintetizada (`speak`) profere instrução discriminativa ("Toque na maçã"). A criança seleciona o estímulo correto entre distratores.
- **Acomodação:** Dica embutida com pulso suave após timeout de latência configurado.

## 3. Minha Vez / Sua Vez (`minha-vez-sua-vez`)
- **Repertório:** Turn-taking, atenção compartilhada e tolerância à espera.
- **Modelo:** Denver (joint-routine) e ABA (suporte social).
- **Core Loop:** Troca de turnos estruturada com avatar ou terapeuta. Indicador visual claro de quem joga agora.
- **Acomodação:** Timer visual de antecipação do turno para redução de impulsividade.

## 4. Organize por Categoria (`organize-categoria`)
- **Repertório:** Categorização e RFFC (Receptivo por Função, Característica e Classe).
- **Modelo:** ABA (trial-based) e Denver (joint-routine).
- **Core Loop:** Estímulo em foco na bandeja e 2 a 4 caixas temáticas (Alimentos, Bichinhos, Veículos, Roupas, Brinquedos, Casa). A criança seleciona a caixa correta.
- **Acomodação:** Respeito estrito a `maxChoices` (2 a 4) e contrabalanceamento de posição das caixas.

## 5. Memória dos Bichos (`memoria-bichos`)
- **Repertório:** Memória de Trabalho Visual e Pareamento Diferido.
- **Modelo:** ABA (trial-based) e Denver (joint-routine).
- **Core Loop:** Tabuleiro de 4 a 6 cartas viradas para baixo (2 a 3 pares de animais: cachorro, gato, peixe). A criança vira 2 cartas. Pares encontrados permanecem virados; pares não correspondentes desviram suavemente após 800ms.
- **Acomodação:** Modo estático desativa rotação 3D para evitar sobrecarga vestibular em crianças com sensibilidade ao movimento.

## 6. História em Ordem (`historia-ordem`)
- **Repertório:** Sequenciamento Temporal, Causalidade e Linguagem Narrativa.
- **Modelo:** ABA (trial-based) e Denver (joint-routine).
- **Core Loop:** Apresentação de 3 etapas cronológicas de uma história ou rotina (ex: Plantação, Manhã, Hora do Lanche). A criança ordena 1º, 2º e 3º nos slots.
- **Acomodação:** Botão de recomeçar ordem para autonomia sem penalidade; numeração discreta nos slots.

## 7. Pequeno Chef (`pequeno-chef`)
- **Repertório:** Análise de Tarefa Lúdica, Cadeia Comportamental e Imitação Funcional.
- **Modelo:** ABA (trial-based) e Denver (joint-routine).
- **Core Loop:** Preparo guiado de receita (ex: Salada de Frutas). A criança adiciona maçã, banana, uva e mistura com a colher. Ingredientes caem na tigela central.
- **Acomodação:** Animações suaves de queda; toque nos ingredientes em bancada tátil de alto contraste.

## 8. Missão Independência (`missao-independencia`)
- **Repertório:** Atividades de Vida Diária (AVD) e Encadeamento (Forward / Backward Chaining).
- **Modelo:** ABA (trial-based) e Denver (joint-routine).
- **Core Loop:** Treino de etapas de autocuidado (Lavar as Mãos, Calçar o Tênis, Escovar os Dentes). A criança identifica a próxima ação com apoio de checklist visual.
- **Acomodação:** Feedback tátil imediato e barra de checklist persistente.

## 9. Causa e Efeito (`causa-efeito`)
- **Repertório:** Intencionalidade Operante Precoce e Tolerância Sensorial (Denver Nível 1).
- **Modelo:** Denver (joint-routine) e ABA (apoio sensorial).
- **Core Loop:** Bolhas e estrelas flutuantes em tons suaves (paleta calma). Toque em qualquer ponto da tela emite resposta sonora pentatônica relaxante (C4-E5). A cada 5 toques intencionais, uma constelação comemora o engajamento.
- **Acomodação:** Impossível "errar" — foco exclusivo no reforço do comportamento operante motor e na auto-regulação.
