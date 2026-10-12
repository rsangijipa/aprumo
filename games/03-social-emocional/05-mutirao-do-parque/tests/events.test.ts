import { describe, it, expect } from 'vitest';
import { EventSystem } from '../src/simulation/EventSystem';
import eventsData from '../src/data/events.json';

describe('EventSystem', () => {
  it('should include exactly 15 dynamic collaborative events', () => {
    const all = EventSystem.getAllEvents();
    expect(all.length).toBe(15);
  });

  it('should provide 5-8 seconds advance warning before triggering', () => {
    const all = EventSystem.getAllEvents();
    all.forEach(event => {
      expect(event.warningDuration).toBeGreaterThanOrEqual(5);
      expect(event.warningDuration).toBeLessThanOrEqual(8);
      expect(event.duration).toBeGreaterThan(0);
    });
  });

  it('should transition smoothly through warning -> active -> ended', () => {
    const eventDef = EventSystem.getEventById('event_chuva_verao')!;
    const state = EventSystem.startEvent(eventDef);

    expect(state.phase).toBe('warning');

    // Advance past warning period
    const update1 = EventSystem.updateEvent(state, eventDef.warningDuration + 0.1);
    expect(update1.phaseChanged).toBe(true);
    expect(update1.newEventPhase).toBe('active');
    expect(state.phase).toBe('active');

    // Advance past active duration
    const update2 = EventSystem.updateEvent(state, eventDef.duration + 0.1);
    expect(update2.phaseChanged).toBe(true);
    expect(update2.newEventPhase).toBe('ended');
    expect(update2.updatedEvent).toBe(null);
  });
});
