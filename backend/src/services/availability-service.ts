import { randomUUID } from "node:crypto";
import { isRecord, validationError } from "../domain/errors";
import { ensurePositiveRange, parseDateTime, rangesOverlap, toIsoString } from "../domain/time";
import type { AvailabilityWindow, PublishAvailabilityWindowRequest } from "../domain/types";
import { MemoryStore } from "../storage/memory-store";

export class AvailabilityService {
  constructor(private readonly store: MemoryStore) {}

  list(): AvailabilityWindow[] {
    return [...this.store.availabilityWindows].sort(
      (left, right) => new Date(left.startAt).valueOf() - new Date(right.startAt).valueOf(),
    );
  }

  create(input: unknown): AvailabilityWindow {
    if (!isRecord(input)) {
      validationError("Request body must be a JSON object.");
    }

    const payload: PublishAvailabilityWindowRequest = {
      startAt: toIsoString(parseDateTime(input.startAt, "startAt")),
      endAt: toIsoString(parseDateTime(input.endAt, "endAt")),
    };

    const startAt = new Date(payload.startAt);
    const endAt = new Date(payload.endAt);

    ensurePositiveRange(startAt, endAt, "Availability window must satisfy startAt < endAt.");

    const overlaps = this.store.availabilityWindows.some((window) =>
      rangesOverlap(startAt, endAt, new Date(window.startAt), new Date(window.endAt)),
    );

    if (overlaps) {
      validationError("Availability window must not overlap an existing window.");
    }

    const window: AvailabilityWindow = {
      id: randomUUID(),
      startAt: payload.startAt,
      endAt: payload.endAt,
    };

    this.store.availabilityWindows.push(window);
    return window;
  }
}
