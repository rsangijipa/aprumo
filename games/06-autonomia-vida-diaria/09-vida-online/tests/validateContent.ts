/**
 * TEST SUITE & CONTENT QA VALIDATOR — VIDA ONLINE
 * Tests narrative branching integrity, indicator balance, no dead ends, no real data leaks.
 */

import { EPISODES } from '../src/narrative/content/episodes';
import { CHARACTERS } from '../src/narrative/content/characters';

let errorsCount = 0;
let testsCount = 0;

function assert(condition: boolean, message: string) {
  testsCount++;
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    errorsCount++;
  } else {
    console.log(`✅ SUCESSO: ${message}`);
  }
}

console.log('\n--- 1. TESTES DE ESTRUTURA DOS 12 EPISÓDIOS ---');
assert(EPISODES.length === 12, `Deve conter exatamente 12 episódios (encontrados: ${EPISODES.length})`);

EPISODES.forEach((ep) => {
  assert(ep.id.length > 0, `Episódio ${ep.number} deve ter ID válido`);
  assert(ep.nodes[ep.startingNodeId] !== undefined, `Episódio ${ep.id} deve ter o nó inicial ${ep.startingNodeId} existente`);
  assert(CHARACTERS[ep.chatPartnerId] !== undefined, `Interlocutor ${ep.chatPartnerId} do episódio ${ep.id} deve existir no elenco`);

  // Validar branching: cada escolha aponta para um nó existente ou para summary
  Object.values(ep.nodes).forEach((node) => {
    node.choices.forEach((choice) => {
      const targetExists = ep.nodes[choice.targetNodeId] !== undefined || choice.targetNodeId.includes('summary');
      assert(targetExists, `Escolha "${choice.label}" no nó ${node.id} deve apontar para nó válido (alvo: ${choice.targetNodeId})`);
    });
  });
});

console.log('\n--- 2. TESTES DE INDICADORES NEUTROS ---');
EPISODES.forEach((ep) => {
  Object.values(ep.nodes).forEach((node) => {
    node.choices.forEach((choice) => {
      if (choice.effects?.indicatorChanges) {
        const changes = choice.effects.indicatorChanges;
        const validKeys = ['privacidade', 'clareza', 'limites', 'confianca'];
        Object.keys(changes).forEach((key) => {
          assert(validKeys.includes(key), `Indicador ${key} deve ser um dos 4 neutros`);
        });
      }
    });
  });
});

console.log('\n--- 3. CONTENT QA: PRIVACIDADE & SEGURANÇA ---');
const forbiddenRealPatterns = [
  /whatsapp\.com/i,
  /discord\.gg/i,
  /tiktok\.com/i,
  /instagram\.com/i,
  /\bcpf\b/i,
  /\brg\b/i,
  /cart[aã]o de cr[eé]dito/i
];
let foundForbidden = false;

EPISODES.forEach((ep) => {
  Object.values(ep.nodes).forEach((node) => {
    node.messages.forEach((msg) => {
      forbiddenRealPatterns.forEach((pattern) => {
        if (pattern.test(msg.text)) {
          foundForbidden = true;
          console.error(`Termo proibido encontrado no episódio ${ep.id}: ${pattern}`);
        }
      });
    });
  });
});
assert(!foundForbidden, 'Nenhum dado real ou link de rede real proibida presente no roteiro');

console.log(`\n========================================`);
console.log(`Testes executados: ${testsCount} | Falhas: ${errorsCount}`);
console.log(`========================================\n`);

if (errorsCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 Todos os testes de narrativa e QA de conteúdo passaram com perfeição!');
}
