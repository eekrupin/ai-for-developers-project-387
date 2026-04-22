import { Card, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Owner } from '../../api/types'
import { AsyncState } from '../../components/ui/AsyncState'

export function OwnerProfilePage() {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .getOwnerProfile()
      .then(setOwner)
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Stack gap="lg">
      <Title order={3}>Профиль владельца</Title>

      <AsyncState loading={loading} error={error}>
        {owner ? (
          <Card withBorder radius="md">
            <Stack gap={6}>
              <Text fw={700}>{owner.name}</Text>
              <Text c="dimmed">ID: {owner.id}</Text>
            </Stack>
          </Card>
        ) : null}
      </AsyncState>
    </Stack>
  )
}
