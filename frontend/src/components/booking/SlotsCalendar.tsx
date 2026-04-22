import { Badge, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { formatDayOfMonth, formatSlotsCount, formatWeekdayShort, isTodayDateKey } from '../../lib/date'

type SlotsCalendarProps = {
  dateKeys: string[]
  selectedDateKey: string | null
  slotsCountByDate: Record<string, number>
  onSelect: (dateKey: string) => void
}

export function SlotsCalendar({
  dateKeys,
  selectedDateKey,
  slotsCountByDate,
  onSelect,
}: SlotsCalendarProps) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700}>Выберите день</Text>
            <Text size="sm" c="dimmed">
              Показываем ближайшие 14 дней, доступные для записи.
            </Text>
          </div>
          <Badge variant="light">14 дней</Badge>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4, md: 2, lg: 4 }}>
          {dateKeys.map((dateKey) => {
            const slotsCount = slotsCountByDate[dateKey] || 0
            const isSelected = selectedDateKey === dateKey
            const isToday = isTodayDateKey(dateKey)
            const hasSlots = slotsCount > 0
            const textColor = isSelected ? 'white' : hasSlots ? 'dark' : 'dimmed'
            const metaColor = isSelected ? 'white' : hasSlots ? 'green' : 'dimmed'

            return (
              <Button
                key={dateKey}
                data-testid={`calendar-day-${dateKey}`}
                aria-pressed={isSelected}
                aria-label={`${formatWeekdayShort(dateKey)} ${formatDayOfMonth(dateKey)}. ${slotsCount > 0 ? formatSlotsCount(slotsCount) : 'Слотов нет'}`}
                variant={isSelected ? 'filled' : 'default'}
                color={isSelected ? 'indigo' : 'gray'}
                onClick={() => onSelect(dateKey)}
                disabled={!hasSlots}
                h="auto"
                px="md"
                py="sm"
                styles={{
                  root: !isSelected
                    ? hasSlots
                      ? {
                          backgroundColor: 'var(--mantine-color-green-0)',
                          borderColor: 'var(--mantine-color-green-2)',
                        }
                      : {
                          backgroundColor: 'var(--mantine-color-gray-0)',
                          borderColor: 'var(--mantine-color-gray-2)',
                        }
                    : undefined,
                  inner: { display: 'block', width: '100%' },
                  label: { width: '100%' },
                }}
              >
                <Stack gap={2} align="flex-start">
                  <Group gap={6} wrap="nowrap">
                    <Text tt="uppercase" size="xs" c={textColor}>
                      {formatWeekdayShort(dateKey)}
                    </Text>
                    {isToday ? (
                      <Text size="xs" c={isSelected ? 'white' : hasSlots ? 'green' : 'dimmed'}>
                        Сегодня
                      </Text>
                    ) : null}
                  </Group>
                  <Text fw={700} size="lg" c={textColor}>
                    {formatDayOfMonth(dateKey)}
                  </Text>
                  <Text size="xs" c={metaColor}>
                    {slotsCount > 0 ? formatSlotsCount(slotsCount) : 'Нет слотов'}
                  </Text>
                </Stack>
              </Button>
            )
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
