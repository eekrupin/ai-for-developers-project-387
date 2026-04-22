import { Card, Stack, Text } from '@mantine/core'
import type { AvailabilityWindow } from '../../api/types'
import { formatDateTimeRange } from '../../lib/date'

type AvailabilityWindowListProps = {
  windows: AvailabilityWindow[]
}

export function AvailabilityWindowList({ windows }: AvailabilityWindowListProps) {
  return (
    <Stack gap="md">
      {windows.map((window) => (
        <Card key={window.id} withBorder radius="md">
          <Text fw={600}>{formatDateTimeRange(window.startAt, window.endAt)}</Text>
        </Card>
      ))}
    </Stack>
  )
}
