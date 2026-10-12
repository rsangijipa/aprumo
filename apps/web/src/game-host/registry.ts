/**
 * Catálogo de jogos instalados. Manifestos são carregados já (leves); o código do jogo só
 * quando a criança abre a atividade, dentro do iframe.
 * Release gate: nenhum jogo entra aqui sem manifesto clínico válido (validado em teste).
 */
import type { ComponentType } from 'react';
import type { GameManifest } from '@aprumo/protocol';
import { manifest as encontreOIgual } from '@aprumo/game-encontre-o-igual/manifest';
import { manifest as escolhaPelaInstrucao } from '@aprumo/game-escolha-pela-instrucao/manifest';
import { manifest as minhaVezSuaVez } from '@aprumo/game-minha-vez-sua-vez/manifest';
import { manifest as organizeCategoria } from '@aprumo/game-organize-categoria/manifest';
import { manifest as memoriaBichos } from '@aprumo/game-memoria-bichos/manifest';
import { manifest as historiaOrdem } from '@aprumo/game-historia-ordem/manifest';
import { manifest as pequenoChef } from '@aprumo/game-pequeno-chef/manifest';
import { manifest as missaoIndependencia } from '@aprumo/game-missao-independencia/manifest';
import { manifest as causaEfeito } from '@aprumo/game-causa-efeito/manifest';
import { manifest as espelhoMagico } from '@aprumo/game-espelho-magico/manifest';
import { manifest as olhaComigo } from '@aprumo/game-olha-comigo/manifest';
import { manifest as detetiveDasEmocoes } from '@aprumo/game-detetive-das-emocoes/manifest';
import { manifest as circuitoExecutivo } from '@aprumo/game-circuito-executivo/manifest';
import { manifest as miniMundos } from '@aprumo/game-minimundos/manifest';
import { manifest as socialCity } from '@aprumo/game-social-city/manifest';
import { manifest as bolhasMagicas } from '@aprumo/game-bolhas-magicas/manifest';
import { manifest as tamborDaImitacao } from '@aprumo/game-tambor-da-imitacao/manifest';
import { manifest as sigaOMestre } from '@aprumo/game-siga-o-mestre/manifest';
import { manifest as dancaDoCongelar } from '@aprumo/game-danca-do-congelar/manifest';
import { manifest as encaixaAi } from '@aprumo/game-encaixa-ai/manifest';
import { manifest as rampaMaluca } from '@aprumo/game-rampa-maluca/manifest';
import { manifest as lancheDoUrso } from '@aprumo/game-lanche-do-urso/manifest';
import { manifest as fazendinhaSonora } from '@aprumo/game-fazendinha-sonora/manifest';
import { manifest as leituraDeCena } from '@aprumo/game-leitura-de-cena/manifest';
import { manifest as parPerfeito } from '@aprumo/game-par-perfeito/manifest';
import { manifest as cadaUmNoSeuPote } from '@aprumo/game-cada-um-no-seu-pote/manifest';
import { manifest as mutiraoDoParque } from '@aprumo/game-mutirao-do-parque/manifest';
import { manifest as bandaDoTico } from '@aprumo/game-banda-do-tico/manifest';
import { manifest as torreDerruba } from '@aprumo/game-torre-derruba/manifest';
import { manifest as mercadinhoDaEsquina } from '@aprumo/game-mercadinho-da-esquina/manifest';
import { manifest as passoAPasso } from '@aprumo/game-passo-a-passo/manifest';
import { manifest as quadroDeConquistas } from '@aprumo/game-quadro-de-conquistas/manifest';
import { manifest as escapeRoomKids } from '@aprumo/game-escape-room-kids/manifest';
import { manifest as vidaOnline } from '@aprumo/game-vida-online/manifest';
import { manifest as quadroDeFichas } from '@aprumo/resource-quadro-de-fichas/manifest';
import { manifest as agendaVisual } from '@aprumo/resource-agenda-visual/manifest';

export interface GameEntry {
  manifest: GameManifest;
  load: () => Promise<ComponentType>;
}

export const GAMES: Record<string, GameEntry> = {
  'encontre-o-igual': { manifest: encontreOIgual, load: () => import('@aprumo/game-encontre-o-igual').then((m) => m.Game) },
  'escolha-pela-instrucao': { manifest: escolhaPelaInstrucao, load: () => import('@aprumo/game-escolha-pela-instrucao').then((m) => m.Game) },
  'minha-vez-sua-vez': { manifest: minhaVezSuaVez, load: () => import('@aprumo/game-minha-vez-sua-vez').then((m) => m.Game) },
  'organize-categoria': { manifest: organizeCategoria, load: () => import('@aprumo/game-organize-categoria').then((m) => m.Game) },
  'memoria-bichos': { manifest: memoriaBichos, load: () => import('@aprumo/game-memoria-bichos').then((m) => m.Game) },
  'historia-ordem': { manifest: historiaOrdem, load: () => import('@aprumo/game-historia-ordem').then((m) => m.Game) },
  'pequeno-chef': { manifest: pequenoChef, load: () => import('@aprumo/game-pequeno-chef').then((m) => m.Game) },
  'missao-independencia': { manifest: missaoIndependencia, load: () => import('@aprumo/game-missao-independencia').then((m) => m.Game) },
  'causa-efeito': { manifest: causaEfeito, load: () => import('@aprumo/game-causa-efeito').then((m) => m.Game) },
  'espelho-magico': { manifest: espelhoMagico, load: () => import('@aprumo/game-espelho-magico').then((m) => m.Game) },
  'olha-comigo': { manifest: olhaComigo, load: () => import('@aprumo/game-olha-comigo').then((m) => m.Game) },
  'detetive-das-emocoes': { manifest: detetiveDasEmocoes, load: () => import('@aprumo/game-detetive-das-emocoes').then((m) => m.Game) },
  'circuito-executivo': { manifest: circuitoExecutivo, load: () => import('@aprumo/game-circuito-executivo').then((m) => m.Game) },
  'minimundos': { manifest: miniMundos, load: () => import('@aprumo/game-minimundos').then((m) => m.Game) },
  'social-city': { manifest: socialCity, load: () => import('@aprumo/game-social-city').then((m) => m.Game) },
  'bolhas-magicas': { manifest: bolhasMagicas, load: () => import('@aprumo/game-bolhas-magicas').then((m) => m.Game) },
  'tambor-da-imitacao': { manifest: tamborDaImitacao, load: () => import('@aprumo/game-tambor-da-imitacao').then((m) => m.Game) },
  'siga-o-mestre': { manifest: sigaOMestre, load: () => import('@aprumo/game-siga-o-mestre').then((m) => m.Game) },
  'danca-do-congelar': { manifest: dancaDoCongelar, load: () => import('@aprumo/game-danca-do-congelar').then((m) => m.Game) },
  'encaixa-ai': { manifest: encaixaAi, load: () => import('@aprumo/game-encaixa-ai').then((m) => m.Game) },
  'rampa-maluca': { manifest: rampaMaluca, load: () => import('@aprumo/game-rampa-maluca').then((m) => m.Game) },
  'lanche-do-urso': { manifest: lancheDoUrso, load: () => import('@aprumo/game-lanche-do-urso').then((m) => m.Game) },
  'fazendinha-sonora': { manifest: fazendinhaSonora, load: () => import('@aprumo/game-fazendinha-sonora').then((m) => m.Game) },
  'leitura-de-cena': { manifest: leituraDeCena, load: () => import('@aprumo/game-leitura-de-cena').then((m) => m.Game) },
  'par-perfeito': { manifest: parPerfeito, load: () => import('@aprumo/game-par-perfeito').then((m) => m.Game) },
  'cada-um-no-seu-pote': { manifest: cadaUmNoSeuPote, load: () => import('@aprumo/game-cada-um-no-seu-pote').then((m) => m.Game) },
  'mutirao-do-parque': { manifest: mutiraoDoParque, load: () => import('@aprumo/game-mutirao-do-parque').then((m) => m.Game) },
  'banda-do-tico': { manifest: bandaDoTico, load: () => import('@aprumo/game-banda-do-tico').then((m) => m.Game) },
  'torre-derruba': { manifest: torreDerruba, load: () => import('@aprumo/game-torre-derruba').then((m) => m.Game) },
  'mercadinho-da-esquina': { manifest: mercadinhoDaEsquina, load: () => import('@aprumo/game-mercadinho-da-esquina').then((m) => m.Game) },
  'passo-a-passo': { manifest: passoAPasso, load: () => import('@aprumo/game-passo-a-passo').then((m) => m.Game) },
  'quadro-de-conquistas': { manifest: quadroDeConquistas, load: () => import('@aprumo/game-quadro-de-conquistas').then((m) => m.Game) },
  'escape-room-kids': { manifest: escapeRoomKids, load: () => import('@aprumo/game-escape-room-kids').then((m) => m.Game as ComponentType<any>) },
  'vida-online': { manifest: vidaOnline, load: () => import('@aprumo/game-vida-online').then((m) => m.Game as ComponentType<any>) },
};

/** Recursos de apoio rodam na própria moldura infantil (não em iframe): são da plataforma. */
export const SUPPORT_RESOURCES: GameManifest[] = [quadroDeFichas, agendaVisual];
