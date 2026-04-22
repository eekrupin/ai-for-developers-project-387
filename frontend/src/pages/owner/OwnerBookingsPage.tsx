import { Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { UpcomingBooking } from '../../api/types'
import { BookingList } from '../../components/booking/BookingList'
import { AsyncState } from '../../components/ui/AsyncState'

export function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<UpcomingBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .listUpcomingBookings()
      .then(setBookings)
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Stack gap="lg">
      <div>
        <Title order={3}>Предстоящие бронирования</Title>
        <Text c="dimmed">Список строится из `GET /owner/bookings/upcoming`.</Text>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!bookings.length}
        emptyTitle="Предстоящих бронирований нет"
      >
        <BookingList bookings={bookings} />
      </AsyncState>
    </Stack>
  )
}
