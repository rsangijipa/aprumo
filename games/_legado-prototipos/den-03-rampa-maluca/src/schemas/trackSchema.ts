import { z } from 'zod';

export const RampTrackConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rampAngleDeg: z.number().min(15).max(40),
  hasBridge: z.boolean(),
  hasTunnel: z.boolean(),
  targetType: z.enum(['pinos', 'garagem', 'alvo']),
  pinCount: z.number().int().min(1).max(10),
});

export const DEFAULT_TRACKS: z.infer<typeof RampTrackConfigSchema>[] = [
  {
    id: 'track-padrao',
    name: 'Rampa de Papelão Tradicional',
    rampAngleDeg: 25,
    hasBridge: false,
    hasTunnel: false,
    targetType: 'pinos',
    pinCount: 3,
  },
  {
    id: 'track-ingreme',
    name: 'Descida Super Veloz (40°)',
    rampAngleDeg: 40,
    hasBridge: false,
    hasTunnel: false,
    targetType: 'pinos',
    pinCount: 5,
  },
  {
    id: 'track-ponte',
    name: 'Ponte sobre o Igarapé',
    rampAngleDeg: 22,
    hasBridge: true,
    hasTunnel: false,
    targetType: 'pinos',
    pinCount: 3,
  },
  {
    id: 'track-tunel',
    name: 'Túnel Secreto da Selva',
    rampAngleDeg: 28,
    hasBridge: false,
    hasTunnel: true,
    targetType: 'garagem',
    pinCount: 3,
  },
];
