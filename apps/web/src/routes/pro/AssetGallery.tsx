import { useState } from 'react';
import { Badge, Button, IconPrinter } from '@aprumo/ui';

interface AssetEntry {
  id: string;
  name: string;
  category: string;
  type: 'raster_ai' | 'vector_procedural';
  path: string;
  prompt: string;
  generator: string;
  dimensions: string;
  clinicalUse: string;
  fallback?: string | null;
}

const ASSETS: AssetEntry[] = [
  {
    id: 'match_apple',
    name: 'Maçã Vermelha (Soft Clay)',
    category: 'Match Lab',
    type: 'raster_ai',
    path: '/generated/match-lab/apple.jpg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'A single fresh crisp red apple, soft 3D clay aesthetic, tactile smooth geometry with subtle warm lighting, centered on a clean pure neutral white background, high contrast, perfect for a pediatric clinical matching app.',
    generator: 'Nano Banana (Gemini 3.1 Flash Image)',
    fallback: '/assets/stimulus_apple_softclay.svg',
    clinicalUse: 'Pareamento de idênticos e categorização alimentar no jogo Encontre o Igual.',
  },
  {
    id: 'match_banana',
    name: 'Bananas Maduras (Soft Clay)',
    category: 'Match Lab',
    type: 'raster_ai',
    path: '/generated/match-lab/banana.jpg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'A bunch of ripe yellow bananas, soft 3D clay aesthetic, smooth rounded shapes with gentle organic curves, clean neutral white background, centered composition, high visual clarity for pediatric matching.',
    generator: 'Nano Banana (Gemini 3.1 Flash Image)',
    fallback: 'packages/stimuli/src/art.tsx:banana',
    clinicalUse: 'Discriminação visual e resposta de ouvinte em Pequeno Chef e Encontre o Igual.',
  },
  {
    id: 'match_car',
    name: 'Carrinho Azul (Soft Clay)',
    category: 'Match Lab',
    type: 'raster_ai',
    path: '/generated/match-lab/car.jpg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'A cute little bright blue toy passenger car, soft 3D clay aesthetic, chunky rounded friendly wheels and windows, centered on pure neutral white background, playful tactile style, pediatric learning visual.',
    generator: 'Nano Banana (Gemini 3.1 Flash Image)',
    fallback: '/assets/stimulus_car_softclay.svg',
    clinicalUse: 'Pareamento funcional e categoria de veículos em Encontre o Igual.',
  },
  {
    id: 'routine_brush_teeth',
    name: 'Escovar os Dentes',
    category: 'Agenda Visual',
    type: 'vector_procedural',
    path: '/assets/routine_brush_teeth.svg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'Toothbrush with child-safe blue ergonomic handle and soft bristles topped with a dollop of white and red striped toothpaste, soft 3D volumetric shading.',
    generator: 'Aprumo Design System Vector Pipeline',
    fallback: null,
    clinicalUse: 'Cartão visual para rotina AVD e estúdio de análise de tarefas.',
  },
  {
    id: 'routine_wash_hands',
    name: 'Lavar as Mãos',
    category: 'Agenda Visual',
    type: 'vector_procedural',
    path: '/assets/routine_wash_hands.svg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'Gentle cartoon hands under soft water droplets with soap suds, warm reassuring palette, clear step visual for hand hygiene routine.',
    generator: 'Aprumo Design System Vector Pipeline',
    fallback: null,
    clinicalUse: 'Cartão para Primeira Tarefa (Premack) e rotina de autocuidado.',
  },
  {
    id: 'character_sheet_leo',
    name: 'Folha de Personagem: Leo',
    category: 'Espelho Mágico',
    type: 'vector_procedural',
    path: '/assets/character_sheet_leo.svg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'Character expression sheet of a young friendly child with expressive facial cues (happy, attentive, calm), soft clay styling.',
    generator: 'Aprumo Design System Vector Pipeline',
    fallback: null,
    clinicalUse: 'Avatar e modelo de imitação facial no jogo Espelho Mágico.',
  },
  {
    id: 'environment_teen_cafe',
    name: 'Ambiente Adolescente: Cafeteria',
    category: 'Histórias Sociais',
    type: 'vector_procedural',
    path: '/assets/environment_teen_cafe.svg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'Cozy minimal cafe interior with warm lighting, wood tables, calm seating area, designed for social interaction rehearsal for neurodivergent teens.',
    generator: 'Aprumo Design System Vector Pipeline',
    fallback: null,
    clinicalUse: 'Cenário de treino de habilidades sociais para o modo adolescente e Social City.',
  },
  {
    id: 'avatar_imitation_child',
    name: 'Avatar de Imitação Infantil',
    category: 'Espelho Mágico',
    type: 'vector_procedural',
    path: '/assets/avatar_imitation_child.svg',
    dimensions: '1024x1024 (1:1)',
    prompt:
      'Stylized smiling child avatar facing front, friendly large eyes, calm pastel tones, designed for imitation training.',
    generator: 'Aprumo Design System Vector Pipeline',
    fallback: null,
    clinicalUse: 'Feedback de espelhamento motor e emocional no Espelho Mágico.',
  },
];

export default function AssetGallery() {
  const [filterType, setFilterType] = useState<'all' | 'raster_ai' | 'vector_procedural'>('all');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<AssetEntry | null>(null);

  const categories = ['all', ...Array.from(new Set(ASSETS.map((a) => a.category)))];

  const filtered = ASSETS.filter((a) => {
    const matchType = filterType === 'all' || a.type === filterType;
    const matchCat = filterCat === 'all' || a.category === filterCat;
    return matchType && matchCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-head pro-mb-0">
        <div>
          <h1>Galeria de Assets Clínicos & Contact Sheet</h1>
          <p>
            Auditoria visual de assets de arte da plataforma Aprumo. Distinção formal entre saídas raster geradas
            pelo pipeline de IA (Nano Banana) e ilustrações vetoriais procedurais de fallback (SVG).
          </p>
        </div>
        <Button variant="default" onClick={() => window.print()} icon={<IconPrinter />}>
          Imprimir Folha de Contato
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--ap-surface)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--ap-border)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)' }}>
            TIPO DE ARTE:
          </span>
          {[
            ['all', 'Todos os Assets'],
            ['raster_ai', '✨ Raster IA (Nano Banana)'],
            ['vector_procedural', '📐 Vetor Procedural (SVG)'],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              className="rs-tab-pill"
              aria-pressed={filterType === val}
              onClick={() => setFilterType(val as any)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)' }}>
            CATEGORIA:
          </span>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="rs-tab-pill"
              aria-pressed={filterCat === c}
              onClick={() => setFilterCat(c)}
            >
              {c === 'all' ? 'Todas' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filtered.map((asset) => (
          <article
            key={asset.id}
            style={{
              background: 'var(--ap-surface, #ffffff)',
              borderRadius: '20px',
              border: '1px solid var(--ap-border)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--ap-shadow-xs)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* Asset Visual Preview */}
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                background: 'var(--ap-surface-sunken, #f8fafc)',
                display: 'grid',
                placeItems: 'center',
                padding: '1.5rem',
                borderBottom: '1px solid var(--ap-border)',
              }}
            >
              <img
                src={asset.path}
                alt={asset.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
                loading="lazy"
              />
            </div>

            {/* Asset Info Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{asset.name}</h3>
                  <Badge tone={asset.type === 'raster_ai' ? 'success' : 'info'}>
                    {asset.type === 'raster_ai' ? 'Nano Banana' : 'SVG Fallback'}
                  </Badge>
                </div>
                <span className="ap-xs ap-muted" style={{ fontWeight: 600 }}>
                  {asset.category} · {asset.dimensions}
                </span>
                <p className="ap-small" style={{ margin: '0.5rem 0 0', color: 'var(--ap-text-muted)' }}>
                  {asset.clinicalUse}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => setSelectedAsset(asset)}
                >
                  🔍 Inspecionar Prompt & Metadados
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal Inspector */}
      {selectedAsset && (
        <div className="rs-modal-overlay">
          <div className="rs-modal-content" style={{ maxWidth: '640px' }} role="dialog" aria-modal="true" aria-labelledby="modal-asset-title">
            <header className="rs-modal-head">
              <h2 id="modal-asset-title">{selectedAsset.name}</h2>
              <button
                type="button"
                className="rs-modal-close"
                onClick={() => setSelectedAsset(null)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </header>

            <div className="rs-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: '160px', height: '160px', background: 'var(--ap-surface-sunken)', borderRadius: '16px', display: 'grid', placeItems: 'center', padding: '0.5rem' }}>
                  <img src={selectedAsset.path} alt={selectedAsset.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div><strong>ID:</strong> <code>{selectedAsset.id}</code></div>
                  <div><strong>Gerador / Origem:</strong> {selectedAsset.generator}</div>
                  <div><strong>Dimensões:</strong> {selectedAsset.dimensions}</div>
                  <div><strong>Caminho:</strong> <code>{selectedAsset.path}</code></div>
                  {selectedAsset.fallback && (
                    <div><strong>Fallback Associado:</strong> <code>{selectedAsset.fallback}</code></div>
                  )}
                </div>
              </div>

              <div style={{ background: 'var(--ap-surface-sunken)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--ap-border)' }}>
                <strong style={{ display: 'block', fontSize: 'var(--ap-text-xs)', textTransform: 'uppercase', color: 'var(--ap-text-muted)', marginBottom: '0.3rem' }}>
                  Prompt Utilizado para Geração:
                </strong>
                <blockquote style={{ margin: 0, fontStyle: 'italic', fontSize: 'var(--ap-text-sm)', color: 'var(--ap-text)' }}>
                  "{selectedAsset.prompt}"
                </blockquote>
              </div>
            </div>

            <footer className="rs-modal-footer">
              <Button variant="primary" onClick={() => setSelectedAsset(null)}>
                Fechar Inspetor
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
