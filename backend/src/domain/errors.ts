export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown): never {
  throw new HttpError(400, "bad_request", message, details);
}

export function notFound(message: string, details?: unknown): never {
  throw new HttpError(404, "not_found", message, details);
}

export function validationError(message: string, details?: unknown): never {
  throw new HttpError(422, "validation_error", message, details);
}

export function bookingTimeConflict(message: string, details: unknown): never {
  throw new HttpError(409, "booking_time_conflict", message, details);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
