import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import type { UpcomingBooking } from '../../api/types'
import { formatDateTimeRange } from '../../lib/date'

type BookingListProps = {
  bookings: UpcomingBooking[]
}

export function BookingList({ bookings }: BookingListProps) {
  return (
    <Stack gap="md">
      {bookings.map((booking) => (
        <Card key={booking.id} withBorder radius="md">
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={700}>{booking.eventTypeName}</Text>
                <Text size="sm" c="dimmed">
                  {formatDateTimeRange(booking.startAt, booking.endAt)}
                </Text>
              </div>
              <Badge color={booking.status === 'confirmed' ? 'green' : 'gray'}>
                {booking.status}
              </Badge>
            </Group>

            <Text size="sm">Гость: {booking.guestName}</Text>
            <Text size="sm">Email: {booking.guestEmail}</Text>
            {booking.guestComment ? <Text size="sm">Комментарий: {booking.guestComment}</Text> : null}
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
