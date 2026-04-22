import { Alert, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { EventType } from '../../api/types'
import { EventTypeCard } from '../../components/event-types/EventTypeCard'
import { AsyncState } from '../../components/ui/AsyncState'

export function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .listPublicEventTypes()
      .then(setEventTypes)
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Запись на встречу</Title>
        <Text c="dimmed">Выберите тип события, затем слот и заполните форму бронирования.</Text>
      </div>

      <Alert title="Источник данных">
        Сейчас frontend обращается к <code>{api.apiBaseUrl}</code>.
      </Alert>

      <AsyncState
        loading={loading}
        error={error}
        empty={!eventTypes.length}
        emptyTitle="Типы событий пока не опубликованы"
        emptyDescription="Когда владелец создаст типы событий, они появятся здесь."
      >
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {eventTypes.map((eventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} to={`/event-types/${eventType.id}`} />
          ))}
        </SimpleGrid>
      </AsyncState>
    </Stack>
  )
}
