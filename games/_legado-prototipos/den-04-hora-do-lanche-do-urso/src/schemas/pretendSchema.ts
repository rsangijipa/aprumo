import { z } from 'zod';

export const PretendItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['comida', 'bebida', 'higiene', 'cuidado', 'simbolico']),
  iconEmoji: z.string().min(1),
  compatibleZones: z.array(z.enum(['boca', 'rosto', 'corpo', 'cabeca'])).min(1),
  soundType: z.enum(['munch', 'drink', 'wipe', 'sleep', 'surprise', 'giggle']),
  speechText: z.string().min(1),
});

export const TeachingEpisodeSchema = z.object({
  episodeId: z.string().min(1),
  timestamp: z.number().int().positive(),
  character: z.enum(['urso', 'boneca', 'cachorro', 'avo']),
  action: z.string().min(1),
  item: z.string().min(1),
  zone: z.enum(['boca', 'rosto', 'corpo', 'cabeca']),
  isSubstitution: z.boolean(),
  location: z.enum(['tela', 'brinquedo-real']), // Mandatory tracking of transfer to real toy!
  promptLevel: z.enum(['independente', 'parcial', 'total']),
  sequenceLength: z.number().int().min(1),
});
