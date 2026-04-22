import type { AvailabilityWindow, Booking, EventType, Owner } from "../domain/types";
import { createSeedData } from "./seed";

export class MemoryStore {
  owner: Owner;

  eventTypes: EventType[];

  availabilityWindows: AvailabilityWindow[];

  bookings: Booking[];

  constructor(now = new Date()) {
    const seedData = createSeedData(now);

    this.owner = seedData.owner;
    this.eventTypes = seedData.eventTypes;
    this.availabilityWindows = seedData.availabilityWindows;
    this.bookings = seedData.bookings;
  }
}
