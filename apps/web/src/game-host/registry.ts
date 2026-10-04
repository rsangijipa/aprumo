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
};

/** Recursos de apoio rodam na própria moldura infantil (não em iframe): são da plataforma. */
export const SUPPORT_RESOURCES: GameManifest[] = [quadroDeFichas, agendaVisual];
