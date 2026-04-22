import {
  Alert,
  Button,
  Card,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { api, ApiError } from '../../api/client'
import type { AvailabilityWindow } from '../../api/types'
import { AvailabilityWindowList } from '../../components/availability/AvailabilityWindowList'
import { AsyncState } from '../../components/ui/AsyncState'
import { toIsoDateTime } from '../../lib/date'

export function OwnerAvailabilityPage() {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [startAtValue, setStartAtValue] = useState('')
  const [endAtValue, setEndAtValue] = useState('')

  useEffect(() => {
    api
      .listAvailabilityWindows()
      .then(setWindows)
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false))
  }, [])

  async function handlePublish() {
    const startAt = toIsoDateTime(startAtValue)
    const endAt = toIsoDateTime(endAtValue)

    if (!startAt || !endAt) {
      setSubmitError('Укажите начало и конец интервала.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const createdWindow = await api.publishAvailabilityWindow({ startAt, endAt })
      setWindows((current) => [createdWindow, ...current])
      setStartAtValue('')
      setEndAtValue('')
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
      <Title order={3}>Окна доступности</Title>

      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Text fw={600}>Опубликовать доступность</Text>

          {submitError ? (
            <Alert color="red" title="Не удалось опубликовать окно">
              {submitError}
            </Alert>
          ) : null}

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput
              type="datetime-local"
              label="Начало"
              value={startAtValue}
              onChange={(event) => setStartAtValue(event.currentTarget.value)}
              required
            />
            <TextInput
              type="datetime-local"
              label="Конец"
              value={endAtValue}
              onChange={(event) => setEndAtValue(event.currentTarget.value)}
              required
            />
          </SimpleGrid>

          <Button onClick={handlePublish} loading={submitting}>
            Опубликовать окно
          </Button>
        </Stack>
      </Card>

      <AsyncState
        loading={loading}
        error={error}
        empty={!windows.length}
        emptyTitle="Окна доступности не опубликованы"
        emptyDescription="После публикации интервалы появятся в списке ниже."
      >
        <AvailabilityWindowList windows={windows} />
      </AsyncState>
    </Stack>
  )
}
