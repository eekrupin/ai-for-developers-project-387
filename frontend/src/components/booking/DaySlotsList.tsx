import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { Link } from 'react-router-dom'
import type { AvailableSlot } from '../../api/types'
import { formatDateTimeRange, formatTime } from '../../lib/date'

type DaySlotsListProps = {
  slots: AvailableSlot[]
}

export function DaySlotsList({ slots }: DaySlotsListProps) {
  if (!slots.length) {
    return (
      <Card withBorder radius="lg" padding="lg">
        <Stack gap={4}>
          <Text fw={700}>На этот день слотов нет</Text>
          <Text size="sm" c="dimmed">
            Выберите другой день в календаре, чтобы увидеть свободное время.
          </Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Card withBorder radius="lg" padding="lg">
      <Stack gap="md">
        <div>
          <Text fw={700}>Доступное время</Text>
          <Text size="sm" c="dimmed">
            Все интервалы уже рассчитаны под длительность выбранного события.
          </Text>
        </div>

        <Stack gap="sm">
          {slots.map((slot) => {
            const bookingUrl = `/bookings/new?eventTypeId=${slot.eventTypeId}&startAt=${encodeURIComponent(slot.startAt)}&endAt=${encodeURIComponent(slot.endAt)}`

            return (
              <Group key={`${slot.startAt}-${slot.endAt}`} grow wrap="wrap" align="stretch">
                <Button
                  component={Link}
                  to={bookingUrl}
                  data-testid={`slot-button-${slot.startAt}`}
                  variant="light"
                  color="indigo"
                  justify="space-between"
                  h="auto"
                  px="md"
                  py="md"
                  styles={{ inner: { width: '100%' }, label: { width: '100%' } }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2} align="flex-start">
                      <Text fw={700}>{formatTime(slot.startAt)}</Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTimeRange(slot.startAt, slot.endAt)}
                      </Text>
                    </Stack>
                    <Text size="sm">Выбрать</Text>
                  </Group>
                </Button>
              </Group>
            )
          })}
        </Stack>
      </Stack>
    </Card>
  )
}
