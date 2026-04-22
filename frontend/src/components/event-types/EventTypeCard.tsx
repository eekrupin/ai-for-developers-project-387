import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core'
import { Link } from 'react-router-dom'
import type { EventType } from '../../api/types'

type EventTypeCardProps = {
  eventType: EventType
  to: string
}

export function EventTypeCard({ eventType, to }: EventTypeCardProps) {
  return (
    <Card withBorder radius="md" padding="lg" data-testid={`event-type-card-${eventType.id}`}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={700}>{eventType.name}</Text>
            <Text size="sm" c="dimmed">
              {eventType.description}
            </Text>
          </Stack>
          <Badge variant="light">{eventType.durationMinutes} мин</Badge>
        </Group>

        <Button component={Link} to={to} variant="light" data-testid={`event-type-open-${eventType.id}`}>
          Открыть
        </Button>
      </Stack>
    </Card>
  )
}
