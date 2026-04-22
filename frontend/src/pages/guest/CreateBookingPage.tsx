import {
  Alert,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { EventType } from '../../api/types'
import { AsyncState } from '../../components/ui/AsyncState'
import { formatDateTimeRange } from '../../lib/date'

export function CreateBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const eventTypeId = searchParams.get('eventTypeId') || ''
  const startAt = searchParams.get('startAt') || ''
  const endAt = searchParams.get('endAt') || ''

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestComment, setGuestComment] = useState('')

  const hasRequiredParams = useMemo(() => Boolean(eventTypeId && startAt && endAt), [endAt, eventTypeId, startAt])

  useEffect(() => {
    if (!hasRequiredParams) {
      setError('Нужно выбрать тип события и слот перед бронированием.')
      setLoading(false)
      return
    }

    api
      .getEventType(eventTypeId)
      .then(setEventType)
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false))
  }, [eventTypeId, hasRequiredParams])

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const booking = await api.createBooking({
        eventTypeId,
        startAt,
        endAt,
        guestName,
        guestEmail,
        guestComment: guestComment || undefined,
      })

      navigate(
        `/bookings/success?bookingId=${booking.id}&eventTypeName=${encodeURIComponent(
          booking.eventTypeName,
        )}&startAt=${encodeURIComponent(booking.startAt)}&endAt=${encodeURIComponent(booking.endAt)}`,
      )
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        if (caughtError.status === 409) {
          setSubmitError('Этот слот уже заняли или он успел устареть. Вернитесь назад и выберите другое время.')
        } else {
          setSubmitError(caughtError.payload?.message || caughtError.message)
        }
      } else if (caughtError instanceof Error) {
        setSubmitError(caughtError.message)
      } else {
        setSubmitError('Не удалось создать бронирование.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack gap="lg">
      <Button component={Link} to={eventTypeId ? `/event-types/${eventTypeId}` : '/'} variant="subtle" px={0}>
        Назад
      </Button>

      <Title order={2}>Оформление бронирования</Title>

      <AsyncState loading={loading} error={error}>
        <Stack gap="lg">
          {eventType ? (
            <Card withBorder radius="md" padding="lg">
              <Stack gap={6}>
                <Text fw={700}>{eventType.name}</Text>
                <Text size="sm" c="dimmed">
                  {eventType.description}
                </Text>
                <Text size="sm">Слот: {formatDateTimeRange(startAt, endAt)}</Text>
              </Stack>
            </Card>
          ) : null}

          {submitError ? (
            <Alert color="red" title="Не удалось создать бронирование" data-testid="booking-conflict-alert">
              <Stack gap="xs">
                <Text>{submitError}</Text>
                <Button
                  component={Link}
                  to={eventTypeId ? `/event-types/${eventTypeId}` : '/'}
                  variant="light"
                  color="red"
                  w="fit-content"
                >
                  Вернуться к слотам
                </Button>
              </Stack>
            </Alert>
          ) : null}

          <Card withBorder radius="md" padding="lg" data-testid="booking-form">
            <Stack gap="md">
              <TextInput
                label="Имя"
                placeholder="Иван Петров"
                value={guestName}
                onChange={(event) => setGuestName(event.currentTarget.value)}
                required
              />
              <TextInput
                label="Email"
                placeholder="guest@example.com"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.currentTarget.value)}
                required
              />
              <Textarea
                label="Комментарий"
                placeholder="Коротко опишите тему звонка"
                minRows={3}
                value={guestComment}
                onChange={(event) => setGuestComment(event.currentTarget.value)}
              />

              <Group>
                <Button
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={!guestName || !guestEmail}
                  data-testid="booking-submit"
                >
                  Подтвердить запись
                </Button>
                <Text size="sm" c="dimmed">
                  UI отправляет только данные из формы и выбранный слот.
                </Text>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </AsyncState>
    </Stack>
  )
}
