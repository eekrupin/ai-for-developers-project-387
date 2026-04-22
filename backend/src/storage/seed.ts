import type { AvailabilityWindow, EventType, Owner } from "../domain/types";

const DEFAULT_OWNER: Owner = {
  id: "owner-default",
  name: "Владелец календаря",
};

const DEFAULT_EVENT_TYPES: EventType[] = [
  {
    id: "quick-call-15",
    name: "Быстрый звонок",
    description: "Короткая встреча на 15 минут.",
    durationMinutes: 15,
  },
  {
    id: "standard-call-30",
    name: "Стандартный звонок",
    description: "Базовая встреча на 30 минут.",
    durationMinutes: 30,
  },
];

const SEEDED_AVAILABILITY_DAYS = 3;
const SEEDED_START_HOUR_UTC = 10;
const SEEDED_END_HOUR_UTC = 18;
const DAY_MS = 24 * 60 * 60 * 1000;

export function createSeedData(now: Date) {
  return {
    owner: { ...DEFAULT_OWNER },
    eventTypes: DEFAULT_EVENT_TYPES.map((eventType) => ({ ...eventType })),
    availabilityWindows: createSeedAvailabilityWindows(now),
    bookings: [],
  };
}

function createSeedAvailabilityWindows(now: Date): AvailabilityWindow[] {
  const windows: AvailabilityWindow[] = [];
  const startOfTodayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );

  for (let dayOffset = 0; dayOffset < SEEDED_AVAILABILITY_DAYS; dayOffset += 1) {
    const dayStart = new Date(startOfTodayUtc.valueOf() + dayOffset * DAY_MS);
    const startAt = new Date(dayStart.valueOf());
    const endAt = new Date(dayStart.valueOf());

    startAt.setUTCHours(SEEDED_START_HOUR_UTC, 0, 0, 0);
    endAt.setUTCHours(SEEDED_END_HOUR_UTC, 0, 0, 0);

    const dayKey = startAt.toISOString().slice(0, 10);

    windows.push({
      id: `seed-availability-${dayKey}`,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    });
  }

  return windows;
}
