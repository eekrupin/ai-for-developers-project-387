import { Button, Card, Stack, Text, Title } from '@mantine/core'
import { Link, useSearchParams } from 'react-router-dom'
import { formatDateTimeRange } from '../../lib/date'

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const eventTypeName = searchParams.get('eventTypeName')
  const startAt = searchParams.get('startAt')
  const endAt = searchParams.get('endAt')

  return (
    <Stack gap="lg">
      <Title order={2}>Бронирование создано</Title>

      <Card withBorder radius="md" padding="lg" data-testid="booking-success">
        <Stack gap="sm">
          <Text fw={700}>{eventTypeName || 'Встреча'}</Text>
          {startAt && endAt ? <Text>{formatDateTimeRange(startAt, endAt)}</Text> : null}
          {bookingId ? <Text c="dimmed">Идентификатор бронирования: {bookingId}</Text> : null}
        </Stack>
      </Card>

      <Button component={Link} to="/">
        Вернуться к списку событий
      </Button>
    </Stack>
  )
}
