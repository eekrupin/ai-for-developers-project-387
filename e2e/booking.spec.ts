import { expect, test, type APIRequestContext } from '@playwright/test'
import { backendUrl } from './support/test-env'

const runId = Date.now().toString(36)
const apiBaseUrl = `${backendUrl}/api`

type AvailableSlot = {
  eventTypeId: string
  startAt: string
  endAt: string
}

type TestBookingContext = {
  eventTypeId: string
  eventTypeName: string
  slot: {
    startAt: string
    endAt: string
  }
}

test.describe('Бронирование через frontend и backend', () => {
  test('smoke: приложение открывается и получает данные от backend', async ({ page }, testInfo) => {
    const context = await prepareBookingContext(testInfo.title)

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Календарь звонков' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Запись на встречу' })).toBeVisible()
    await expect(page.getByTestId(`event-type-card-${context.eventTypeId}`)).toBeVisible()

    await page.getByTestId(`event-type-open-${context.eventTypeId}`).click()

    await expect(page.getByRole('heading', { name: context.eventTypeName })).toBeVisible()
    await expect(page.getByText('Выберите день', { exact: true })).toBeVisible()
    await expect(page.getByText('Доступное время', { exact: true })).toBeVisible()
    await expect(page.getByTestId(`slot-button-${context.slot.startAt}`)).toBeVisible()
  })

  test('позитивный сценарий: пользователь бронирует слот до успешного результата', async ({ page }, testInfo) => {
    const context = await prepareBookingContext(testInfo.title)

    await page.goto('/')
    await page.getByTestId(`event-type-open-${context.eventTypeId}`).click()

    await page.getByTestId(`slot-button-${context.slot.startAt}`).click()

    await expect(page).toHaveURL(/\/bookings\/new\?/)
    await expect(page.getByRole('heading', { name: 'Оформление бронирования' })).toBeVisible()
    await expect(page.getByTestId('booking-form')).toBeVisible()

    await page.getByLabel('Имя').fill('Тестовый гость')
    await page.getByLabel('Email').fill('guest@example.com')
    await page.getByLabel('Комментарий').fill('Проверка e2e сценария бронирования')
    await page.getByTestId('booking-submit').click()

    await expect(page).toHaveURL(/\/bookings\/success\?/)
    await expect(page.getByRole('heading', { name: 'Бронирование создано' })).toBeVisible()
    await expect(page.getByTestId('booking-success')).toContainText(context.eventTypeName)
    await expect(page.getByTestId('booking-success')).toContainText('Идентификатор бронирования:')
  })

  test('негативный сценарий: занятому слоту показывается понятная ошибка', async ({ page, request }, testInfo) => {
    const context = await prepareBookingContext(testInfo.title)

    await page.goto('/')
    await page.getByTestId(`event-type-open-${context.eventTypeId}`).click()
    await page.getByTestId(`slot-button-${context.slot.startAt}`).click()

    await bookSlotThroughApi(request, context, {
      guestName: 'Конкурирующий гость',
      guestEmail: 'taken@example.com',
    })

    await page.getByLabel('Имя').fill('Тестовый гость')
    await page.getByLabel('Email').fill('guest@example.com')
    await page.getByTestId('booking-submit').click()

    await expect(page.getByTestId('booking-conflict-alert')).toBeVisible()
    await expect(page.getByTestId('booking-conflict-alert')).toContainText(
      'Этот слот уже заняли или он успел устареть. Вернитесь назад и выберите другое время.',
    )
    await expect(page.getByRole('link', { name: 'Вернуться к слотам' })).toBeVisible()
  })
})

async function prepareBookingContext(seed: string): Promise<TestBookingContext> {
  const eventTypeId = buildEventTypeId(seed)
  const eventTypeName = `E2E ${eventTypeId}`
  const availabilityWindow = buildFutureWindow(seed)

  await postJson('/owner/event-types', {
    id: eventTypeId,
    name: eventTypeName,
    description: 'Тип события для сквозных Playwright проверок.',
    durationMinutes: 30,
  })

  await postJson('/owner/availability-windows', availabilityWindow)

  const slots = await getJson<AvailableSlot[]>(`/event-types/${eventTypeId}/slots`)
  const slot = slots[0]

  if (!slot) {
    throw new Error(`Backend не вернул ни одного слота для ${eventTypeId}`)
  }

  return {
    eventTypeId,
    eventTypeName,
    slot,
  }
}

async function bookSlotThroughApi(
  request: APIRequestContext,
  context: TestBookingContext,
  guest: { guestName: string; guestEmail: string },
) {
  const response = await request.post(`${apiBaseUrl}/bookings`, {
    data: {
      eventTypeId: context.eventTypeId,
      startAt: context.slot.startAt,
      endAt: context.slot.endAt,
      guestName: guest.guestName,
      guestEmail: guest.guestEmail,
    },
  })

  expect(response.ok()).toBeTruthy()
}

async function postJson(path: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Не удалось подготовить тестовые данные: ${path} -> ${response.status}`)
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`)

  if (!response.ok) {
    throw new Error(`Не удалось прочитать тестовые данные: ${path} -> ${response.status}`)
  }

  return (await response.json()) as T
}

function buildEventTypeId(seed: string) {
  return `e2e-${hashSeed(seed)}-${runId}`
}

function buildFutureWindow(seed: string) {
  const offsetDays = getOffsetDays(seed)
  const startAt = new Date()
  startAt.setDate(startAt.getDate() + offsetDays)
  startAt.setHours(10 + offsetDays, 0, 0, 0)

  const endAt = new Date(startAt)
  endAt.setMinutes(endAt.getMinutes() + 30)

  return {
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
  }
}

function getOffsetDays(seed: string) {
  if (seed.includes('smoke')) {
    return 1
  }

  if (seed.includes('позитивный')) {
    return 2
  }

  return 3
}

function hashSeed(seed: string) {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }

  return hash.toString(36)
}
