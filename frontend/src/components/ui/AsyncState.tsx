import { Alert, Center, Loader, Stack, Text, ThemeIcon } from '@mantine/core'
import type { ReactNode } from 'react'

type AsyncStateProps = {
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  children: ReactNode
}

export function AsyncState({
  loading,
  error,
  empty,
  emptyTitle = 'Пока ничего нет',
  emptyDescription,
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert color="red" title="Не удалось загрузить данные">
        {error}
      </Alert>
    )
  }

  if (empty) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <ThemeIcon size="xl" variant="light" radius="xl">
            <Text fw={700}>0</Text>
          </ThemeIcon>
          <Text fw={600}>{emptyTitle}</Text>
          {emptyDescription ? <Text c="dimmed">{emptyDescription}</Text> : null}
        </Stack>
      </Center>
    )
  }

  return <>{children}</>
}
