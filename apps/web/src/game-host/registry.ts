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
};

/** Recursos de apoio rodam na própria moldura infantil (não em iframe): são da plataforma. */
export const SUPPORT_RESOURCES: GameManifest[] = [quadroDeFichas, agendaVisual];
