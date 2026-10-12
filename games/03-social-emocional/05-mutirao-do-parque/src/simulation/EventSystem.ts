import { DynamicEventDef } from '../types';
import eventsData from '../data/events.json';

export interface ActiveEventState {
  def: DynamicEventDef;
  phase: 'warning' | 'active' | 'ended';
  warningTimeLeft: number;
  durationTimeLeft: number;
}

export class EventSystem {
  public static getAllEvents(): DynamicEventDef[] {
    return eventsData as DynamicEventDef[];
  }

  public static getEventById(id: string): DynamicEventDef | undefined {
    return (eventsData as DynamicEventDef[]).find(e => e.id === id);
  }

  public static pickNextRandomEvent(excludeIds: string[] = []): DynamicEventDef {
    const pool = (eventsData as DynamicEventDef[]).filter(e => !excludeIds.includes(e.id));
    if (pool.length === 0) {
      return (eventsData as DynamicEventDef[])[0];
    }
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  public static startEvent(eventDef: DynamicEventDef): ActiveEventState {
    return {
      def: eventDef,
      phase: 'warning',
      warningTimeLeft: eventDef.warningDuration,
      durationTimeLeft: eventDef.duration
    };
  }

  public static updateEvent(
    activeEvent: ActiveEventState | null,
    deltaSeconds: number
  ): {
    updatedEvent: ActiveEventState | null;
    phaseChanged: boolean;
    newEventPhase?: 'active' | 'ended';
  } {
    if (!activeEvent || activeEvent.phase === 'ended') {
      return { updatedEvent: null, phaseChanged: false };
    }

    if (activeEvent.phase === 'warning') {
      activeEvent.warningTimeLeft -= deltaSeconds;
      if (activeEvent.warningTimeLeft <= 0) {
        activeEvent.phase = 'active';
        return {
          updatedEvent: activeEvent,
          phaseChanged: true,
          newEventPhase: 'active'
        };
      }
      return { updatedEvent: activeEvent, phaseChanged: false };
    }

    if (activeEvent.phase === 'active') {
      activeEvent.durationTimeLeft -= deltaSeconds;
      if (activeEvent.durationTimeLeft <= 0) {
        activeEvent.phase = 'ended';
        return {
          updatedEvent: null,
          phaseChanged: true,
          newEventPhase: 'ended'
        };
      }
      return { updatedEvent: activeEvent, phaseChanged: false };
    }

    return { updatedEvent: activeEvent, phaseChanged: false };
  }
}
