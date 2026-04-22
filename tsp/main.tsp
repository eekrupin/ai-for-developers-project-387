import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{ title: "Call Booking API" })
namespace CalendarApi;

// В системе один заранее заданный владелец календаря.
// Регистрация и авторизация в рамках этого контракта отсутствуют.
// В админской части по умолчанию используется этот преднастроенный профиль.

alias EventTypeId = string;
alias AvailabilityWindowId = string;
alias BookingId = string;

model Owner {
  id: string;
  name: string;
}

model EventType {
  id: EventTypeId;
  name: string;
  description: string;
  @minValue(1)
  durationMinutes: int32;
}

model CreateEventTypeRequest {
  id: EventTypeId;
  name: string;
  description: string;
  @minValue(1)
  durationMinutes: int32;
}

model AvailabilityWindow {
  id: AvailabilityWindowId;
  startAt: utcDateTime;
  endAt: utcDateTime;
}

model PublishAvailabilityWindowRequest {
  // Интервал доступности должен быть строго положительным: startAt < endAt.
  // Интервал не должен пересекаться с уже опубликованными окнами доступности.
  // При нарушении сервер возвращает ValidationError.
  startAt: utcDateTime;
  endAt: utcDateTime;
}

enum BookingStatus {
  confirmed,
  cancelled,
}

model Booking {
  id: BookingId;
  eventTypeId: EventTypeId;
  eventTypeName: string;
  startAt: utcDateTime;
  endAt: utcDateTime;
  guestName: string;
  guestEmail: string;
  guestComment?: string;
  status: BookingStatus;
  createdAt: utcDateTime;
}

// Модель для страницы предстоящих встреч владельца.
// Список должен содержать только будущие бронирования всех типов событий.
model UpcomingBooking extends Booking {}

model CreateBookingRequest {
  eventTypeId: EventTypeId;

  // Интервал бронирования должен быть строго положительным: startAt < endAt.
  // Он также должен совпадать с длительностью выбранного типа события
  // и одному из публично доступных слотов для этого eventTypeId.
  // Бронирование допускается только внутри окна записи на ближайшие 14 дней
  // начиная с текущей даты.
  startAt: utcDateTime;
  endAt: utcDateTime;
  guestName: string;
  guestEmail: string;
  guestComment?: string;
}

// Публичный слот вычисляется из доступности владельца, длительности типа события и уже существующих бронирований.
// В список попадают только действительно свободные интервалы: слоты, пересекающиеся
// с любым существующим бронированием календаря, исключаются независимо от типа события.
// По умолчанию список слотов строится на ближайшие 14 дней от текущей даты.
model AvailableSlot {
  eventTypeId: EventTypeId;
  startAt: utcDateTime;
  endAt: utcDateTime;
}

model ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

model BusyConflictDetails {
  requestedStartAt: utcDateTime;
  requestedEndAt: utcDateTime;
  conflictingBookingId?: BookingId;
}

@error
model BadRequestError extends ErrorResponse {
  @statusCode
  statusCode: 400;
}

@error
model NotFoundError extends ErrorResponse {
  @statusCode
  statusCode: 404;
}

@error
model ValidationError extends ErrorResponse {
  @statusCode
  statusCode: 422;

  // Примеры причин: startAt >= endAt, durationMinutes < 1,
  // интервал бронирования не совпадает с длительностью типа события
  // или не соответствует доступному публичному слоту,
  // либо выходит за пределы окна записи ближайших 14 дней.
}

@error
model BookingTimeConflictError {
  @statusCode
  statusCode: 409;

  code: "booking_time_conflict";
  // Конфликт проверяется глобально для всего календаря, а не только внутри одного типа события.
  message: string;
  details: BusyConflictDetails;
}

model CreatedEventType extends EventType {
  @statusCode
  statusCode: 201;
}

model CreatedAvailabilityWindow extends AvailabilityWindow {
  @statusCode
  statusCode: 201;
}

model CreatedBooking extends Booking {
  @statusCode
  statusCode: 201;
}

@route("/owner/profile")
interface OwnerProfileApi {
  @get
  getOwnerProfile(): Owner;
}

@route("/owner/event-types")
interface OwnerEventTypesApi {
  @get
  listEventTypes(): EventType[];

  @post
  createEventType(
    @body input: CreateEventTypeRequest,
  ): CreatedEventType | BadRequestError | ValidationError;
}

@route("/owner/availability-windows")
interface OwnerAvailabilityApi {
  @get
  listAvailabilityWindows(): AvailabilityWindow[];

  @post
  publishAvailabilityWindow(
    @body input: PublishAvailabilityWindowRequest,
  ): CreatedAvailabilityWindow | BadRequestError | ValidationError;
}

@route("/owner/bookings/upcoming")
interface OwnerBookingsApi {
  @get
  listUpcomingBookings(): UpcomingBooking[];
}

@route("/event-types")
interface GuestEventTypesApi {
  @get
  listPublicEventTypes(): EventType[];

  @get
  @route("/{eventTypeId}")
  getEventType(
    @path eventTypeId: EventTypeId,
  ): EventType | NotFoundError;

  @get
  @route("/{eventTypeId}/slots")
  listAvailableSlots(
    @path eventTypeId: EventTypeId,
    // Если диапазон не передан, сервер возвращает слоты на ближайшие 14 дней
    // начиная с текущей даты. Если диапазон передан, он должен быть строго
    // положительным и полностью лежать в этом 14-дневном окне.
    // При нарушении сервер возвращает ValidationError.
    @query from?: utcDateTime,
    @query to?: utcDateTime,
  ): AvailableSlot[] | BadRequestError | NotFoundError | ValidationError;
}

@route("/bookings")
interface GuestBookingsApi {
  @post
  createBooking(
    @body input: CreateBookingRequest,
  ):
    | CreatedBooking
    | BadRequestError
    | NotFoundError
    | ValidationError
    | BookingTimeConflictError;
}
