import { Card, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { AsyncState } from '../../components/ui/AsyncState'

type DashboardData = {
  ownerName: string
  eventTypesCount: number
  availabilityCount: number
  bookingsCount: number
}

export function OwnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getOwnerProfile(),
      api.listOwnerEventTypes(),
      api.listAvailabilityWindows(),
      api.listUpcomingBookings(),
    ])
      .then(([owner, eventTypes, availabilityWindows, bookings]) => {
        setData({
          ownerName: owner.name,
          eventTypesCount: eventTypes.length,
          availabilityCount: availabilityWindows.length,
          bookingsCount: bookings.length,
        })
      })
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Stack gap="lg">
      <div>
        <Title order={3}>Обзор</Title>
        <Text c="dimmed">Краткая сводка по данным, доступным через owner API.</Text>
      </div>

      <AsyncState loading={loading} error={error}>
        <SimpleGrid cols={{ base: 1, md: 4 }}>
          <Card withBorder radius="md">
            <Text size="sm" c="dimmed">
              Владелец
            </Text>
            <Text fw={700}>{data?.ownerName}</Text>
          </Card>
          <Card withBorder radius="md">
            <Text size="sm" c="dimmed">
              Типы событий
            </Text>
            <Text fw={700}>{data?.eventTypesCount}</Text>
          </Card>
          <Card withBorder radius="md">
            <Text size="sm" c="dimmed">
              Окна доступности
            </Text>
            <Text fw={700}>{data?.availabilityCount}</Text>
          </Card>
          <Card withBorder radius="md">
            <Text size="sm" c="dimmed">
              Предстоящие бронирования
            </Text>
            <Text fw={700}>{data?.bookingsCount}</Text>
          </Card>
        </SimpleGrid>
      </AsyncState>
    </Stack>
  )
}
