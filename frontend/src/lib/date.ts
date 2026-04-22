import type { AvailableSlot } from '../api/types'

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})

const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
})

const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export type SlotsByDate = Record<string, AvailableSlot[]>

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatDateTimeRange(startAt: string, endAt: string) {
  return `${formatDateTime(startAt)} - ${formatDateTime(endAt)}`
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value))
}

export function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined
}

export function toDateTimeInputValue(value: string) {
  const date = new Date(value)
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

export function getLocalDateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatWeekdayShort(dateKey: string) {
  return weekdayFormatter.format(getDateFromKey(dateKey))
}

export function formatFullDate(dateKey: string) {
  return fullDateFormatter.format(getDateFromKey(dateKey))
}

export function formatDayOfMonth(dateKey: string) {
  return getDateFromKey(dateKey).getDate()
}

export function isTodayDateKey(dateKey: string) {
  return dateKey === getLocalDateKey(new Date())
}

export function formatSlotsCount(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} слот`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} слота`
  }

  return `${count} слотов`
}

export function buildUpcomingDateKeys(daysCount: number) {
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  return Array.from({ length: daysCount }, (_, index) => {
    const nextDate = new Date(startDate)
    nextDate.setDate(startDate.getDate() + index)
    return getLocalDateKey(nextDate)
  })
}

export function groupSlotsByLocalDate(slots: AvailableSlot[]): SlotsByDate {
  return slots.reduce<SlotsByDate>((groups, slot) => {
    const dateKey = getLocalDateKey(slot.startAt)
    const dateSlots = groups[dateKey] || []

    dateSlots.push(slot)
    groups[dateKey] = dateSlots.sort(
      (leftSlot, rightSlot) =>
        new Date(leftSlot.startAt).getTime() - new Date(rightSlot.startAt).getTime(),
    )

    return groups
  }, {})
}
