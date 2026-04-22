import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { AvailableSlot, EventType } from '../../api/types'
import { DaySlotsList } from '../../components/booking/DaySlotsList'
import { SlotsCalendar } from '../../components/booking/SlotsCalendar'
import { AsyncState } from '../../components/ui/AsyncState'
import {
  buildUpcomingDateKeys,
  formatFullDate,
  formatSlotsCount,
  getDateFromKey,
  groupSlotsByLocalDate,
  isTodayDateKey,
} from '../../lib/date'

export function EventTypeDetailsPage() {
  const { eventTypeId = '' } = useParams()
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const loadData = useCallback(() => {
    setLoading(true)
    setError(null)

    Promise.all([api.getEventType(eventTypeId), api.listAvailableSlots(eventTypeId)])
      .then(([eventTypeResponse, slotsResponse]) => {
        setEventType(eventTypeResponse)
        setSlots(slotsResponse)
      })
      .catch((caughtError: Error) => {
        if (caughtError instanceof ApiError && caughtError.status === 404) {
          setError('Тип события не найден.')
          return
        }

        setError(caughtError.message)
      })
      .finally(() => setLoading(false))
  }, [eventTypeId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const slotsByDate = useMemo(() => groupSlotsByLocalDate(slots), [slots])
  const dateKeys = useMemo(() => {
    const upcomingDateKeys = buildUpcomingDateKeys(14)
    const mergedDateKeys = new Set([...upcomingDateKeys, ...Object.keys(slotsByDate)])

    return Array.from(mergedDateKeys).sort(
      (leftDateKey, rightDateKey) =>
        getDateFromKey(leftDateKey).getTime() - getDateFromKey(rightDateKey).getTime(),
    )
  }, [slotsByDate])
  const slotsCountByDate = useMemo(
    () =>
      dateKeys.reduce<Record<string, number>>((counts, dateKey) => {
        counts[dateKey] = slotsByDate[dateKey]?.length || 0
        return counts
      }, {}),
    [dateKeys, slotsByDate],
  )
  const firstAvailableDateKey = useMemo(
    () => dateKeys.find((dateKey) => (slotsByDate[dateKey] || []).length > 0) || null,
    [dateKeys, slotsByDate],
  )
  const activeDateKey = selectedDateKey && slotsByDate[selectedDateKey] ? selectedDateKey : firstAvailableDateKey
  const activeDaySlots = activeDateKey ? slotsByDate[activeDateKey] || [] : []

  useEffect(() => {
    if (!selectedDateKey || !slotsByDate[selectedDateKey]) {
      setSelectedDateKey(firstAvailableDateKey)
    }
  }, [firstAvailableDateKey, selectedDateKey, slotsByDate])

  return (
    <Stack gap="lg">
      <Button component={Link} to="/" variant="subtle" px={0}>
        Назад к списку
      </Button>

      {eventType ? (
        <Card withBorder radius="lg" padding="xl">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <div>
                <Title order={2}>{eventType.name}</Title>
                <Text c="dimmed">{eventType.description}</Text>
              </div>
              <Badge variant="light" size="lg">
                {eventType.durationMinutes} мин
              </Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Сначала выберите день, затем свободное время. Все интервалы уже соответствуют длительности события.
            </Text>
          </Stack>
        </Card>
      ) : null}

      <AsyncState
        loading={loading}
        error={error}
        empty={!slots.length}
        emptyTitle="Свободных слотов нет"
        emptyDescription="Попробуйте вернуться позже: владелец мог ещё не опубликовать доступное время на ближайшие 14 дней."
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" verticalSpacing="lg">
          <SlotsCalendar
            dateKeys={dateKeys}
            selectedDateKey={activeDateKey}
            slotsCountByDate={slotsCountByDate}
            onSelect={setSelectedDateKey}
          />

          <Stack gap="md">
            <Card withBorder radius="lg" padding="lg">
              <Stack gap={4}>
                <Text fw={700}>Выбранный день</Text>
                <Text size="sm" c="dimmed">
                  {activeDateKey ? formatFullDate(activeDateKey) : 'Нет доступных дней'}
                </Text>
                {activeDateKey ? (
                  <Text size="sm" c="dimmed">
                    {isTodayDateKey(activeDateKey) ? 'Можно записаться уже сегодня.' : 'Дата доступна для бронирования.'}
                  </Text>
                ) : null}
                {eventType ? (
                  <Text size="sm" c="dimmed">
                    Длительность встречи: {eventType.durationMinutes} мин
                  </Text>
                ) : null}
                {activeDaySlots.length ? (
                  <Text size="sm" c="dimmed">
                    Доступно: {formatSlotsCount(activeDaySlots.length)}
                  </Text>
                ) : null}
              </Stack>
            </Card>

            <DaySlotsList slots={activeDaySlots} />
          </Stack>
        </SimpleGrid>
      </AsyncState>
    </Stack>
  )
}
