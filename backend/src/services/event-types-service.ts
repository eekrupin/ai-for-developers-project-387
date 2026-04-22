import type { CreateEventTypeRequest, EventType } from "../domain/types";
import { isRecord, validationError } from "../domain/errors";
import { asPositiveInteger, asTrimmedString } from "../domain/time";
import { MemoryStore } from "../storage/memory-store";

export class EventTypesService {
  constructor(private readonly store: MemoryStore) {}

  list(): EventType[] {
    return [...this.store.eventTypes].sort((left, right) => left.name.localeCompare(right.name));
  }

  getById(id: string): EventType | undefined {
    return this.store.eventTypes.find((eventType) => eventType.id === id);
  }

  create(input: unknown): EventType {
    if (!isRecord(input)) {
      validationError("Request body must be a JSON object.");
    }

    const eventType: CreateEventTypeRequest = {
      id: asTrimmedString(input.id, "id"),
      name: asTrimmedString(input.name, "name"),
      description: asTrimmedString(input.description, "description"),
      durationMinutes: asPositiveInteger(input.durationMinutes, "durationMinutes"),
    };

    if (this.getById(eventType.id)) {
      validationError(`Event type \"${eventType.id}\" already exists.`);
    }

    this.store.eventTypes.push(eventType);
    return eventType;
  }
}
