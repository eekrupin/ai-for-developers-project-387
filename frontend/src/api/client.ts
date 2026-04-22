import type {
  ApiErrorPayload,
  AvailabilityWindow,
  AvailableSlot,
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  Owner,
  PublishAvailabilityWindowRequest,
  UpcomingBooking,
} from './types'

const FALLBACK_API_BASE_URL = '/api'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL).replace(
  /\/$/,
  '',
)

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message || `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const rawBody = await response.text()
  let parsedBody: unknown

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody) as unknown
    } catch {
      parsedBody = undefined
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, parsedBody as ApiErrorPayload | undefined)
  }

  return parsedBody as T
}

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const api = {
  apiBaseUrl,
  getOwnerProfile: () => request<Owner>('/owner/profile'),
  listOwnerEventTypes: () => request<EventType[]>('/owner/event-types'),
  createEventType: (input: CreateEventTypeRequest) =>
    request<EventType>('/owner/event-types', { method: 'POST', body: input }),
  listAvailabilityWindows: () => request<AvailabilityWindow[]>('/owner/availability-windows'),
  publishAvailabilityWindow: (input: PublishAvailabilityWindowRequest) =>
    request<AvailabilityWindow>('/owner/availability-windows', {
      method: 'POST',
      body: input,
    }),
  listUpcomingBookings: () => request<UpcomingBooking[]>('/owner/bookings/upcoming'),
  listPublicEventTypes: () => request<EventType[]>('/event-types'),
  getEventType: (eventTypeId: string) => request<EventType>(`/event-types/${eventTypeId}`),
  listAvailableSlots: (eventTypeId: string, from?: string, to?: string) =>
    request<AvailableSlot[]>(
      `/event-types/${eventTypeId}/slots${buildQuery({ from, to })}`,
    ),
  createBooking: (input: CreateBookingRequest) =>
    request<Booking>('/bookings', { method: 'POST', body: input }),
}
