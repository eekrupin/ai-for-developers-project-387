import type { components } from './schema'

export type AvailabilityWindow = components['schemas']['AvailabilityWindow']
export type AvailableSlot = components['schemas']['AvailableSlot']
export type Booking = components['schemas']['Booking']
export type BookingTimeConflictError =
  components['schemas']['BookingTimeConflictError']
export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
export type ErrorResponse = components['schemas']['ErrorResponse']
export type EventType = components['schemas']['EventType']
export type Owner = components['schemas']['Owner']
export type PublishAvailabilityWindowRequest =
  components['schemas']['PublishAvailabilityWindowRequest']
export type UpcomingBooking = components['schemas']['UpcomingBooking']
export type ValidationError = components['schemas']['ValidationError']

export type ApiErrorPayload = ErrorResponse | BookingTimeConflictError
