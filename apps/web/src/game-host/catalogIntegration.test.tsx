// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import GamesPage from '../routes/public/pages/GamesPage';
import Library from '../routes/pro/Library';
import { PROGRAM_TEMPLATES } from '../data/templates';
import { GAMES } from './registry';

describe('New Games Catalog and Integration Tests', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders all 4 new games on the public GamesPage with proper badges and summaries', () => {
    render(
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>
    );

    // Verify game headings
    expect(screen.getByText('Encaixa Aí')).toBeDefined();
    expect(screen.getByText('Rampa Maluca')).toBeDefined();
    expect(screen.getByText('Hora do Lanche do Urso')).toBeDefined();
    expect(screen.getByText('Fazendinha Sonora')).toBeDefined();

    // Verify summaries
    expect(screen.getByText(/Quebra-cabeça de encaixe com pino, em 6 níveis/i)).toBeDefined();
    expect(screen.getByText(/Carrinhos e bolinhas na rampa com "Preparar… apontar… já!"/i)).toBeDefined();
    expect(screen.getByText(/Dar comida, água, banho e pôr o urso/i)).toBeDefined();
    expect(screen.getByText(/Livro de abas "Cadê a vaca\?" com sons de animais/i)).toBeDefined();

    // Verify model badges
    const abaBadges = screen.getAllByText('ABA');
    expect(abaBadges.length).toBeGreaterThan(0);
    const denverBadges = screen.getAllByText('Denver');
    expect(denverBadges.length).toBeGreaterThan(0);
  });

  it('renders all 4 new games in Library with model and age filtering capabilities', () => {
    render(
      <MemoryRouter>
        <Library />
      </MemoryRouter>
    );

    // Initial state: all games visible
    expect(screen.getByText('Encaixa Aí')).toBeDefined();
    expect(screen.getByText('Rampa Maluca')).toBeDefined();
    expect(screen.getByText('Hora do Lanche do Urso')).toBeDefined();
    expect(screen.getByText('Fazendinha Sonora')).toBeDefined();

    // Filter by ABA
    const abaFilterBtn = screen.getByRole('tab', { name: 'ABA' });
    fireEvent.click(abaFilterBtn);

    expect(screen.getByText('Encaixa Aí')).toBeDefined();
    expect(screen.queryByText('Rampa Maluca')).toBeNull();
    expect(screen.queryByText('Hora do Lanche do Urso')).toBeNull();
    expect(screen.queryByText('Fazendinha Sonora')).toBeNull();

    // Filter by Denver
    const denverFilterBtn = screen.getByRole('tab', { name: 'Denver' });
    fireEvent.click(denverFilterBtn);

    expect(screen.queryByText('Encaixa Aí')).toBeNull();
    expect(screen.getByText('Rampa Maluca')).toBeDefined();
    expect(screen.getByText('Hora do Lanche do Urso')).toBeDefined();
    expect(screen.getByText('Fazendinha Sonora')).toBeDefined();

    // Filter by 1-3 anos
    const babyAgeBtn = screen.getByRole('tab', { name: '1–3 anos' });
    fireEvent.click(babyAgeBtn);
    expect(screen.getByText('Fazendinha Sonora')).toBeDefined();
    expect(screen.getByText('Rampa Maluca')).toBeDefined();

    // Reset to Todos
    const allModelsBtn = screen.getByRole('tab', { name: 'Todos' });
    fireEvent.click(allModelsBtn);
    const allAgesBtn = screen.getByRole('tab', { name: 'Todas' });
    fireEvent.click(allAgesBtn);

    expect(screen.getByText('Encaixa Aí')).toBeDefined();
    expect(screen.getByText('Rampa Maluca')).toBeDefined();
  });

  it('suggests the 4 games in the corresponding clinical program templates', () => {
    // 1. Encaixe / encadeamento
    const encaixeTpl = PROGRAM_TEMPLATES.find((t) => t.id === 'tpl-encaixe-pino' || t.name.includes('Encaixe'));
    expect(encaixeTpl).toBeDefined();
    expect(encaixeTpl!.compatibleApps).toContain('encaixa-ai');

    // 2. Pedido / mand em rotina
    const mandTpl = PROGRAM_TEMPLATES.find((t) => t.id === 'tpl-mand-rotina' || t.id === 'tpl-mando');
    expect(mandTpl).toBeDefined();
    expect(mandTpl!.compatibleApps).toContain('rampa-maluca');

    // 3. Brincar simbólico
    const symbolicTpl = PROGRAM_TEMPLATES.find((t) => t.id === 'tpl-brincar-simbolico');
    expect(symbolicTpl).toBeDefined();
    expect(symbolicTpl!.compatibleApps).toContain('lanche-do-urso');

    // 4. Atenção conjunta com livro
    const bookTpl = PROGRAM_TEMPLATES.find((t) => t.id === 'tpl-atencao-conjunta-livro');
    expect(bookTpl).toBeDefined();
    expect(bookTpl!.compatibleApps).toContain('fazendinha-sonora');
  });

  it('validates each game manifest parameters: requiresAdult, ageRange, and loads dynamic component', async () => {
    const newGames = ['encaixa-ai', 'rampa-maluca', 'lanche-do-urso', 'fazendinha-sonora'];

    for (const appId of newGames) {
      const entry = GAMES[appId];
      expect(entry).toBeDefined();
      expect(entry!.manifest.clinical.requiresAdult).toBe(true);
      expect(entry!.manifest.clinical.sensory.motionReducible).toBe(true);
      expect(entry!.manifest.clinical.ageRangeMonths[0]).toBeGreaterThanOrEqual(12);

      const Comp = await entry!.load();
      expect(Comp).toBeDefined();
    }
  });
});
