import { Button, Group, Paper, Stack, Title } from '@mantine/core'
import { Link, Outlet, useLocation } from 'react-router-dom'

const ownerLinks = [
  { to: '/owner', label: 'Обзор' },
  { to: '/owner/profile', label: 'Профиль' },
  { to: '/owner/event-types', label: 'Типы событий' },
  { to: '/owner/availability', label: 'Доступность' },
  { to: '/owner/bookings', label: 'Бронирования' },
]

export function OwnerLayout() {
  const location = useLocation()

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Кабинет владельца</Title>
      </div>

      <Paper withBorder radius="md" p="md">
        <Group wrap="wrap">
          {ownerLinks.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              variant={location.pathname === link.to ? 'filled' : 'light'}
            >
              {link.label}
            </Button>
          ))}
        </Group>
      </Paper>

      <Outlet />
    </Stack>
  )
}
