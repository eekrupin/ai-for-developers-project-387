import type { Owner, UpcomingBooking } from "../domain/types";
import { MemoryStore } from "../storage/memory-store";

export class OwnerService {
  constructor(private readonly store: MemoryStore) {}

  getProfile(): Owner {
    return this.store.owner;
  }

  listUpcomingBookings(now: Date): UpcomingBooking[] {
    return this.store.bookings
      .filter((booking) => booking.status === "confirmed" && new Date(booking.startAt).valueOf() >= now.valueOf())
      .sort((left, right) => new Date(left.startAt).valueOf() - new Date(right.startAt).valueOf());
  }
}
