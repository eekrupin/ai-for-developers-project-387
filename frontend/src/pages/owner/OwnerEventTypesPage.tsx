import {
  Alert,
  Button,
  Card,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { api, ApiError } from '../../api/client'
import type { EventType } from '../../api/types'
import { EventTypeCard } from '../../components/event-types/EventTypeCard'
import { AsyncState } from '../../components/ui/AsyncState'

export function OwnerEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(30)

  useEffect(() => {
    api
      .listOwnerEventTypes()
      .then(setEventTypes)
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!id || !name || !description || !durationMinutes) {
      setSubmitError('Заполните все обязательные поля формы.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const createdEventType = await api.createEventType({
        id,
        name,
        description,
        durationMinutes: Number(durationMinutes),
      })

      setEventTypes((current) => [createdEventType, ...current])
      setId('')
      setName('')
      setDescription('')
      setDurationMinutes(30)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setSubmitError(caughtError.payload?.message || caughtError.message)
      } else if (caughtError instanceof Error) {
        setSubmitError(caughtError.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack gap="lg">
      <Title order={3}>Типы событий</Title>

      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Text fw={600}>Создать тип события</Text>

          {submitError ? (
            <Alert color="red" title="Не удалось создать тип события">
              {submitError}
            </Alert>
          ) : null}

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput label="ID" value={id} onChange={(event) => setId(event.currentTarget.value)} required />
            <NumberInput
              label="Длительность, минут"
              min={1}
              value={durationMinutes}
              onChange={(value) => setDurationMinutes(typeof value === 'number' ? value : '')}
              required
            />
          </SimpleGrid>

          <TextInput label="Название" value={name} onChange={(event) => setName(event.currentTarget.value)} required />
          <Textarea
            label="Описание"
            minRows={3}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            required
          />

          <Button onClick={handleCreate} loading={submitting}>
            Создать тип события
          </Button>
        </Stack>
      </Card>

      <AsyncState
        loading={loading}
        error={error}
        empty={!eventTypes.length}
        emptyTitle="Типов событий ещё нет"
        emptyDescription="Создайте первый тип через форму выше."
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
