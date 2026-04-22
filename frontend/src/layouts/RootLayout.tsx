import { AppShell, Button, Container, Group, Stack, Text, Title } from '@mantine/core'
import { Link, Outlet, useLocation } from 'react-router-dom'

export function RootLayout() {
  const location = useLocation()
  const isOwnerRoute = location.pathname.startsWith('/owner')

  return (
    <AppShell header={{ height: 88 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="wrap">
            <Stack gap={0}>
              <Title order={3}>Календарь звонков</Title>
              <Text size="sm" c="dimmed">
                Frontend работает только через HTTP API
              </Text>
            </Stack>

            <Group wrap="wrap">
              <Button component={Link} to="/" variant={isOwnerRoute ? 'default' : 'filled'}>
                Гость
              </Button>
              <Button component={Link} to="/owner" variant={isOwnerRoute ? 'filled' : 'default'}>
                Владелец
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
