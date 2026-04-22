import { badRequest, notFound, validationError } from "../domain/errors";
import {
  ensureInsideBookingWindow,
  ensurePositiveRange,
  getBookingWindow,
  rangesOverlap,
  parseDateTime,
  toIsoString,
} from "../domain/time";
import type { AvailableSlot, Booking, EventType } from "../domain/types";
import { MemoryStore } from "../storage/memory-store";

type SlotRangeInput = {
  from?: string;
  to?: string;
};

type NormalizedRange = {
  start: Date;
  end: Date;
};

export class SlotsService {
  constructor(private readonly store: MemoryStore) {}

  listAvailableSlots(eventTypeId: string, input: SlotRangeInput, now: Date): AvailableSlot[] {
    const eventType = this.store.eventTypes.find((item) => item.id === eventTypeId);

    if (!eventType) {
      notFound(`Event type \"${eventTypeId}\" was not found.`);
    }

    const range = this.normalizeRange(input, now);
    return this.computeAvailableSlots(eventType, range);
  }

  hasExactAvailableSlot(eventType: EventType, startAt: Date, endAt: Date): boolean {
    return this.computeAvailableSlots(eventType, { start: startAt, end: endAt }).some(
      (slot) => slot.startAt === toIsoString(startAt) && slot.endAt === toIsoString(endAt),
    );
  }

  findConflictingBooking(startAt: Date, endAt: Date): Booking | undefined {
    return this.store.bookings.find(
      (booking) =>
        booking.status === "confirmed" &&
        rangesOverlap(startAt, endAt, new Date(booking.startAt), new Date(booking.endAt)),
    );
  }

  private normalizeRange(input: SlotRangeInput, now: Date): NormalizedRange {
    if ((input.from && !input.to) || (!input.from && input.to)) {
      badRequest('Query parameters "from" and "to" must be provided together.');
    }

    if (!input.from || !input.to) {
      const window = getBookingWindow(now);
      return { start: window.start, end: window.end };
    }

    const start = parseDateTime(input.from, "from");
    const end = parseDateTime(input.to, "to");

    ensurePositiveRange(start, end, 'Slots query must satisfy "from" < "to".');
    ensureInsideBookingWindow(
      start,
      end,
      now,
      "Requested slots range must stay within the next 14 days.",
    );

    return { start, end };
  }

  private computeAvailableSlots(eventType: EventType, range: NormalizedRange): AvailableSlot[] {
    const durationMs = eventType.durationMinutes * 60 * 1000;
    const slots: AvailableSlot[] = [];

    const windows = [...this.store.availabilityWindows].sort(
      (left, right) => new Date(left.startAt).valueOf() - new Date(right.startAt).valueOf(),
    );

    for (const window of windows) {
      const windowStart = new Date(window.startAt);
      const windowEnd = new Date(window.endAt);

      for (
        let cursor = windowStart.valueOf();
        cursor + durationMs <= windowEnd.valueOf();
        cursor += durationMs
      ) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor + durationMs);

        if (slotStart.valueOf() < range.start.valueOf() || slotEnd.valueOf() > range.end.valueOf()) {
          continue;
        }

        if (this.findConflictingBooking(slotStart, slotEnd)) {
          continue;
        }

        slots.push({
          eventTypeId: eventType.id,
          startAt: toIsoString(slotStart),
          endAt: toIsoString(slotEnd),
        });
      }
    }

    return slots;
  }
}
