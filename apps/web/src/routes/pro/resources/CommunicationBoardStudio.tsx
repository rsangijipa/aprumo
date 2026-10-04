import { useState } from 'react';
import { Button } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';
import {
  SENTENCE_STARTERS,
  AAC_VOCABULARY,
  type AACItem,
  type AACCAT,
  type SentenceStarter,
  buildSpokenSentence,
  filterVocabularyByCategory,
} from './aac';

export function CommunicationBoardStudio() {
  const [activeStarter, setActiveStarter] = useState<SentenceStarter>(SENTENCE_STARTERS[0]!);
  const [stripItems, setStripItems] = useState<AACItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AACCAT | 'todos'>('todos');

  const filteredItems = filterVocabularyByCategory(AAC_VOCABULARY, selectedCategory);

  const handleAddItem = (item: AACItem) => {
    setStripItems((prev) => [...prev, item]);
    playTones([{ freq: 659.25, dur: 0.08, type: 'sine' }], 'normal');
  };

  const handleRemoveLast = () => {
    setStripItems((prev) => prev.slice(0, -1));
  };

  const handleClearStrip = () => {
    setStripItems([]);
  };

  const handleSpeakSentence = () => {
    const text = buildSpokenSentence(activeStarter.prefix, stripItems);
    playTones([
      { freq: 440, dur: 0.1, type: 'sine' },
      { freq: 554.37, dur: 0.1, delay: 0.08, type: 'sine' },
      { freq: 659.25, dur: 0.16, delay: 0.16, type: 'sine' },
    ], 'normal');
    void speak(text, 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Seletor do Iniciador da Tira de Frase */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>INÍCIO DA FRASE:</span>
        {SENTENCE_STARTERS.map((st) => (
          <button
            key={st.id}
            type="button"
            className="rs-tab-pill"
            aria-pressed={activeStarter.id === st.id}
            onClick={() => setActiveStarter(st)}
          >
            {st.emoji} {st.label}
          </button>
        ))}
      </div>

      {/* Tira de Frase (Sentence Strip) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: 'var(--ap-surface-sunken)',
          borderRadius: '16px',
          border: '2px solid var(--ap-border-strong)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="ap-xs ap-muted" style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
            TIRA DE SENTENÇA VISUAL (PECS / CAA)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {stripItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleRemoveLast}>
                ⌫ Apagar Último
              </Button>
            )}
            {stripItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearStrip}>
                🗑️ Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Linha dos Cartões na Tira */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            flexWrap: 'wrap',
            minHeight: '76px',
            background: 'var(--ap-surface)',
            borderRadius: '12px',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--ap-border)',
          }}
        >
          {/* Cartão do Iniciador */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              background: 'var(--ap-primary-soft, rgba(63, 107, 103, 0.15))',
              border: '2px solid var(--ap-primary)',
              fontWeight: 700,
              fontSize: 'var(--ap-text-sm)',
              color: 'var(--ap-primary)',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{activeStarter.emoji}</span>
            <span>{activeStarter.label}</span>
          </div>

          {/* Cartões Adicionados */}
          {stripItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--ap-surface)',
                border: '2px solid var(--ap-border-strong)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                fontWeight: 700,
                fontSize: 'var(--ap-text-sm)',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
              <span>{item.label}</span>
            </div>
          ))}

          {stripItems.length === 0 && (
            <span className="ap-xs ap-muted" style={{ fontStyle: 'italic', paddingLeft: '0.5rem' }}>
              Toque nos pictogramas abaixo para montar sua frase...
            </span>
          )}
        </div>

        {/* Botão de Falar a Sentença */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <Button variant="primary" size="lg" onClick={handleSpeakSentence}>
            🔊 Falar Frase Completa
          </Button>
        </div>
      </div>

      {/* Categorias do Vocabulário */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {(
          [
            ['todos', 'Todos'],
            ['alimentos', '🍎 Alimentos'],
            ['brinquedos', '🧸 Brinquedos'],
            ['acoes', '🏃 Ações / Rotina'],
            ['pessoas', '🤝 Pessoas'],
            ['sentimentos', '💖 Sentimentos'],
          ] as const
        ).map(([cat, label]) => (
          <button
            key={cat}
            type="button"
            className="rs-tab-pill"
            aria-pressed={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grade de Pictogramas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '0.65rem',
          maxHeight: '360px',
          overflowY: 'auto',
          padding: '0.25rem',
        }}
      >
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleAddItem(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.85rem 0.5rem',
              borderRadius: '16px',
              border: '1px solid var(--ap-border)',
              background: 'var(--ap-surface)',
              cursor: 'pointer',
              minHeight: '84px',
              transition: 'transform 0.12s ease, border-color 0.12s ease',
            }}
          >
            <span style={{ fontSize: '32px' }}>{item.emoji}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ap-text)',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
