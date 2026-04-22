export type Owner = {
  id: string;
  name: string;
};

export type EventType = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
};

export type AvailabilityWindow = {
  id: string;
  startAt: string;
  endAt: string;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  startAt: string;
  endAt: string;
  guestName: string;
  guestEmail: string;
  guestComment?: string;
  status: BookingStatus;
  createdAt: string;
};

export type UpcomingBooking = Booking;

export type AvailableSlot = {
  eventTypeId: string;
  startAt: string;
  endAt: string;
};

export type CreateEventTypeRequest = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
};

export type PublishAvailabilityWindowRequest = {
  startAt: string;
  endAt: string;
};

export type CreateBookingRequest = {
  eventTypeId: string;
  startAt: string;
  endAt: string;
  guestName: string;
  guestEmail: string;
  guestComment?: string;
};
