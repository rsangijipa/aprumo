/**
 * Programas-modelo da organização (textos redigidos pela equipe Aprumo, não por currículos protegidos).
 * Ao aplicar a um caso, viram cópia editável.
 */
import type { Program } from './types';

export type ProgramTemplate = Omit<Program, 'id' | 'caseId' | 'goalId' | 'promptHierarchyId'> & { id: string; domain: string };

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: 'tpl-ouvinte', domain: 'Linguagem receptiva', name: 'Ouvinte — objetos comuns', repertoire: 'listener', procedure: 'DTT',
    operationalDefinition: 'Toca a figura ou o objeto correspondente ao nome falado, em campo de 3, em até 5 s após a instrução.',
    sdTemplate: 'Toque na {alvo}', errorCorrection: 'Reapresentar com dica gestual e, em seguida, tentativa de transferência sem dica.',
    masteryPct: 90, compatibleApps: ['escolha-pela-instrucao'],
  },
  {
    id: 'tpl-pareamento', domain: 'Discriminação visual', name: 'Pareamento de idênticos', repertoire: 'matching', procedure: 'DTT',
    operationalDefinition: 'Coloca ou toca o cartão idêntico ao modelo, em campo de 3, sem dica.',
    sdTemplate: 'Encontre o igual', errorCorrection: 'Retornar o cartão e reapresentar com dica posicional.',
    masteryPct: 90, compatibleApps: ['encontre-o-igual'],
  },
  {
    id: 'tpl-mando', domain: 'Comunicação funcional', name: 'Mando com item visível', repertoire: 'mand', procedure: 'NET',
    operationalDefinition: 'Pede o item visível e fora de alcance por fala, sinal ou prancha, sem modelo do adulto, em até 5 s.',
    sdTemplate: 'Oportunidade natural com o item à vista', errorCorrection: 'Modelo da resposta e entrega após tentativa de imitação.',
    masteryPct: 80, compatibleApps: [],
  },
  {
    id: 'tpl-tato', domain: 'Linguagem expressiva', name: 'Tato de objetos', repertoire: 'tact', procedure: 'DTT',
    operationalDefinition: 'Nomeia o objeto ou a figura apresentada diante da pergunta "o que é?", com articulação compreensível.',
    sdTemplate: 'O que é?', errorCorrection: 'Modelo ecoico e reapresentação com atraso de dica de 0 s.',
    masteryPct: 90, compatibleApps: ['escolha-pela-instrucao'],
  },
  {
    id: 'tpl-imitacao', domain: 'Imitação', name: 'Imitação motora com objetos', repertoire: 'imitation', procedure: 'DTT',
    operationalDefinition: 'Reproduz a ação do adulto com o objeto idêntico em até 5 s após o modelo "faz assim".',
    sdTemplate: 'Faz assim', errorCorrection: 'Dica física parcial na ação e nova tentativa.',
    masteryPct: 90, compatibleApps: [],
  },
  {
    id: 'tpl-turnos', domain: 'Habilidades sociais', name: 'Troca de turnos em jogo', repertoire: 'social', procedure: 'DTT',
    operationalDefinition: 'Aguarda sem tocar durante a vez do parceiro e joga na própria vez em até 8 s.',
    sdTemplate: 'Minha vez… agora é sua vez!', errorCorrection: 'Bloqueio gentil e pista visual do bastão.',
    masteryPct: 90, compatibleApps: ['minha-vez-sua-vez'],
  },
  {
    id: 'tpl-maos', domain: 'Autocuidado (AVD)', name: 'Lavar as mãos (análise de tarefa)', repertoire: 'adl', procedure: 'chaining',
    operationalDefinition: 'Completa os 7 passos da análise de tarefa (abrir torneira a secar as mãos) na sequência, com o nível de ajuda registrado por passo.',
    sdTemplate: 'Vamos lavar as mãos', errorCorrection: 'Dica no passo seguindo a hierarquia e encadeamento total.',
    masteryPct: 100, compatibleApps: [],
  },
];

export const REPERTOIRE_LABEL: Record<string, string> = {
  listener: 'Ouvinte', matching: 'Pareamento', social: 'Social', mand: 'Mando', tact: 'Tato', intraverbal: 'Intraverbal',
  imitation: 'Imitação', echoic: 'Ecoico', play: 'Brincar', adl: 'Autocuidado', academic: 'Acadêmico', alternative_behavior: 'Comportamento alternativo',
};

export const PROCEDURE_LABEL: Record<string, string> = { DTT: 'Tentativas discretas', NET: 'Ensino natural', chaining: 'Encadeamento', fluency: 'Fluência' };

/** Domínios usados em objetivos Denver (estrutura genérica; textos da Lista de Verificação só com licença). */
export const DENVER_DOMAINS = [
  'Comunicação receptiva', 'Comunicação expressiva', 'Atenção conjunta', 'Imitação', 'Habilidades sociais',
  'Brincar', 'Cognição', 'Motricidade fina', 'Motricidade grossa', 'Comportamento', 'Independência pessoal',
];
