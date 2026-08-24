import { LunarCalendarService as CoreLunarCalendarService } from './calendar/LunarCalendarService';
import { MemorialService } from './calendar/MemorialService';
import { EventService } from './calendar/EventService';

export class LunarCalendarService extends CoreLunarCalendarService {
  static async getMemorials(familyId?: string) {
    return MemorialService.getMemorials(familyId);
  }

  static async getUpcomingEvents(familyId?: string) {
    return EventService.getUpcomingEvents(familyId);
  }
}
