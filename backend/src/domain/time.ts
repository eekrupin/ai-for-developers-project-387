import { badRequest, validationError } from "./errors";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const BOOKING_WINDOW_DAYS = 14;

export function parseDateTime(value: unknown, fieldName: string): Date {
  if (typeof value !== "string") {
    badRequest(`Field \"${fieldName}\" must be an ISO datetime string.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    badRequest(`Field \"${fieldName}\" must be an ISO datetime string.`);
  }

  return date;
}

export function asTrimmedString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    badRequest(`Field \"${fieldName}\" must be a string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    validationError(`Field \"${fieldName}\" must not be empty.`);
  }

  return normalized;
}

export function asOptionalTrimmedString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return asTrimmedString(value, fieldName);
}

export function asPositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    badRequest(`Field \"${fieldName}\" must be an integer.`);
  }

  if (value < 1) {
    validationError(`Field \"${fieldName}\" must be greater than or equal to 1.`);
  }

  return value;
}

export function ensurePositiveRange(startAt: Date, endAt: Date, message: string): void {
  if (startAt.valueOf() >= endAt.valueOf()) {
    validationError(message);
  }
}

export function getBookingWindow(now: Date) {
  return {
    start: now,
    end: new Date(now.valueOf() + BOOKING_WINDOW_DAYS * DAY_MS),
  };
}

export function ensureInsideBookingWindow(startAt: Date, endAt: Date, now: Date, message: string): void {
  const window = getBookingWindow(now);

  if (startAt.valueOf() < window.start.valueOf() || endAt.valueOf() > window.end.valueOf()) {
    validationError(message);
  }
}

export function isSameMinuteDuration(startAt: Date, endAt: Date, durationMinutes: number): boolean {
  return endAt.valueOf() - startAt.valueOf() === durationMinutes * MINUTE_MS;
}

export function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA.valueOf() < endB.valueOf() && startB.valueOf() < endA.valueOf();
}

export function toIsoString(value: Date): string {
  return value.toISOString();
}
