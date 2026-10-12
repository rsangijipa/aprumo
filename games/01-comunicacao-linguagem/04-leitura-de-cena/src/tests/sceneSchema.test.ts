import { describe, it, expect } from 'vitest';
import { SCENE_BANK } from '../data/sceneBank';
import { SceneBankSchema, SocialSceneSchema } from '../schemas/sceneSchema';

describe('ABA-07: Social Scene Bank & Zod Schema Validation', () => {
  it('validates entire SCENE_BANK against clinical schema without errors', () => {
    const parseResult = SceneBankSchema.safeParse(SCENE_BANK);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      console.error(parseResult.error.format());
    }
  });

  it('guarantees 100% of scenes have non-empty spoken subtitles for accessibility', () => {
    SCENE_BANK.forEach((scene) => {
      expect(scene.subtitle).toBeDefined();
      expect(scene.subtitle.trim().length).toBeGreaterThan(0);
      expect(scene.spokenText.trim().length).toBeGreaterThan(0);
    });
  });

  it('guarantees each scene has at least one supervisor-approved acceptable response option', () => {
    SCENE_BANK.forEach((scene) => {
      const acceptable = scene.actionOptions.filter((opt) => opt.isAcceptable);
      expect(acceptable.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('verifies hotspot coordinates are strictly within 0-100 viewport percentages', () => {
    SCENE_BANK.forEach((scene) => {
      scene.cues.forEach((cue) => {
        expect(cue.xPct).toBeGreaterThanOrEqual(0);
        expect(cue.xPct).toBeLessThanOrEqual(100);
        expect(cue.yPct).toBeGreaterThanOrEqual(0);
        expect(cue.yPct).toBeLessThanOrEqual(100);
      });
    });
  });

  it('verifies causality module E3 has at least one correct explanation per scene', () => {
    SCENE_BANK.forEach((scene) => {
      const correctReasons = scene.whyReasonOptions.filter((r) => r.isCorrect);
      expect(correctReasons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('rejects a malformed scene lacking an acceptable action', () => {
    const invalidScene = {
      id: 'bad-scene',
      title: 'Cena sem acerto',
      context: 'escola',
      emotion: 'tristeza',
      intensity: 1,
      targetAge: 'infantil',
      spokenText: 'Texto falado',
      subtitle: 'Legenda',
      characterDescription: 'Personagem de teste',
      cues: [
        { cueId: 'c1', type: 'rosto', label: 'Rosto', xPct: 50, yPct: 50 },
      ],
      whyReasonOptions: [
        { id: 'w1', text: 'Motivo 1', isCorrect: true },
        { id: 'w2', text: 'Motivo 2', isCorrect: false },
      ],
      actionOptions: [
        {
          id: 'a1',
          text: 'Atitude errada',
          iconEmoji: '❌',
          isAcceptable: false,
          explanation: 'Inaceitável',
          rehearsalGuide: 'Não faça',
        },
      ],
    };

    const result = SocialSceneSchema.safeParse(invalidScene);
    expect(result.success).toBe(false);
  });
});
