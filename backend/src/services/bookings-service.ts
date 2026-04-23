import { randomUUID } from "node:crypto";
import { bookingTimeConflict, isRecord, notFound, slotConflict, validationError } from "../domain/errors";
import {
  asOptionalTrimmedString,
  asTrimmedString,
  ensureInsideBookingWindow,
  ensurePositiveRange,
  isSameMinuteDuration,
  parseDateTime,
  toIsoString,
} from "../domain/time";
import type { Booking, CreateBookingRequest } from "../domain/types";
import { MemoryStore } from "../storage/memory-store";
import { SlotsService } from "./slots-service";

export class BookingsService {
  constructor(
    private readonly store: MemoryStore,
    private readonly slotsService: SlotsService,
  ) {}

  create(input: unknown, now: Date): Booking {
    if (!isRecord(input)) {
      validationError("Request body must be a JSON object.");
    }

    const payload: CreateBookingRequest = {
      eventTypeId: asTrimmedString(input.eventTypeId, "eventTypeId"),
      startAt: toIsoString(parseDateTime(input.startAt, "startAt")),
      endAt: toIsoString(parseDateTime(input.endAt, "endAt")),
      guestName: asTrimmedString(input.guestName, "guestName"),
      guestEmail: asTrimmedString(input.guestEmail, "guestEmail"),
      guestComment: asOptionalTrimmedString(input.guestComment, "guestComment"),
    };

    const eventType = this.store.eventTypes.find((item) => item.id === payload.eventTypeId);

    if (!eventType) {
      notFound(`Event type \"${payload.eventTypeId}\" was not found.`);
    }

    const startAt = new Date(payload.startAt);
    const endAt = new Date(payload.endAt);

    ensurePositiveRange(startAt, endAt, "Booking interval must satisfy startAt < endAt.");
    ensureInsideBookingWindow(
      startAt,
      endAt,
      now,
      "Booking must stay within the next 14 days.",
    );

    if (!isSameMinuteDuration(startAt, endAt, eventType.durationMinutes)) {
      validationError("Booking duration must match the selected event type duration.");
    }

    const bookingAttempt = this.slotsService.tryBookSlot(eventType, startAt, endAt);

    if (!bookingAttempt.success) {
      if (bookingAttempt.reason === "conflict") {
        slotConflict("The requested slot is already booked.");
      } else {
        slotConflict("The requested slot is not available.");
      }
    }

    const booking: Booking = {
      id: randomUUID(),
      eventTypeId: eventType.id,
      eventTypeName: eventType.name,
      startAt: payload.startAt,
      endAt: payload.endAt,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      guestComment: payload.guestComment,
      status: "confirmed",
      createdAt: toIsoString(now),
    };

    this.store.bookings.push(booking);
    return booking;
  }
}
