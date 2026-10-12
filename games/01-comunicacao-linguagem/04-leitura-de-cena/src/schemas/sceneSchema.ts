import { z } from 'zod';

export const CueHotspotSchema = z.object({
  cueId: z.string().min(1),
  type: z.enum(['rosto', 'corpo', 'fala', 'objeto_ambiente']),
  label: z.string().min(1),
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
});

export const ActionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  iconEmoji: z.string().min(1),
  isAcceptable: z.boolean(),
  explanation: z.string().min(1),
  rehearsalGuide: z.string().min(1),
});

export const SocialSceneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  context: z.enum(['escola', 'casa', 'rua', 'celular', 'jogos']),
  emotion: z.enum([
    'alegria',
    'tristeza',
    'raiva',
    'medo',
    'surpresa',
    'frustracao',
    'ansiedade',
    'ironia',
    'calma',
  ]),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  targetAge: z.enum(['infantil', 'adolescente']),
  spokenText: z.string().min(1),
  subtitle: z.string().min(1), // Mandatory subtitle in 100% of spoken dialogs
  characterDescription: z.string().min(1),
  cues: z.array(CueHotspotSchema).min(1),
  whyReasonOptions: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1),
      isCorrect: z.boolean(),
    })
  ).min(2),
  actionOptions: z.array(ActionOptionSchema).refine(
    (opts) => opts.some((o) => o.isAcceptable),
    { message: 'Toda cena deve ter ao menos uma resposta aceitável marcada pelo supervisor.' }
  ),
});

export const SceneBankSchema = z.array(SocialSceneSchema);
