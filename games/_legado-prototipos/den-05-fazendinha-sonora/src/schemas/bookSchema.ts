import { z } from 'zod';

export const FlapDataSchema = z.object({
  id: z.string().min(1),
  coverLabel: z.string().min(1),
  coverColor: z.string().min(1),
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
  widthPct: z.number().min(10).max(80),
  heightPct: z.number().min(10).max(80),
  animalId: z.enum([
    'vaca',
    'cavalo',
    'galinha',
    'pato',
    'cachorro',
    'gato',
    'porco',
    'arara',
    'capivara',
    'sapo',
  ]),
  animalName: z.string().min(1),
  onomatopoeia: z.string().min(1),
  animalEmoji: z.string().min(1),
  isOpen: z.boolean(),
  isShaking: z.boolean(),
});

export const BookPageSchema = z.object({
  pageNumber: z.number().int().positive(),
  title: z.string().min(1),
  scenery: z.enum(['fazenda', 'pasto', 'lagoa', 'selva', 'curral']),
  promptText: z.string().min(1),
  flaps: z.array(FlapDataSchema).min(1).max(4),
});

export const BookConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  theme: z.enum(['fazenda', 'rio', 'familia']),
  pages: z.array(BookPageSchema).min(1),
});
