# Календарь звонков

[![Actions Status](https://github.com/eekrupin/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/eekrupin/ai-for-developers-project-386/actions)

Учебный проект по подходу API First. На текущем шаге в репозитории зафиксирован TypeSpec-контракт сервиса бронирования звонков для владельца календаря и гостя.

Теперь в репозитории также есть отдельное frontend-приложение на React + Vite + Mantine, которое работает через HTTP API по контракту из `tsp/main.tsp`.
Для локальной разработки и production-сборки добавлен отдельный backend на Node.js + TypeScript + Express с хранением данных в памяти процесса.

## Артефакты шага

- `tsp/main.tsp` — TypeSpec-спецификация API-контракта.
- `docs/spec-coverage.md` — проверка покрытия сценариев владельца и гостя, а также правила глобальной занятости слота.
- `frontend/` — отдельное frontend-приложение.
- `backend/` — отдельный backend, реализующий контракт поверх in-memory storage.
- `Dockerfile` — production-сборка одного контейнера с frontend и backend.

## Что уже зафиксировано

- владелец может создавать типы событий;
- владелец может публиковать доступное время для встреч;
- владелец может просматривать предстоящие бронирования;
- гость может просматривать типы событий и свободные слоты в ближайшие 14 дней;
- гость может создавать бронирование без регистрации и авторизации;
- владелец задает `id`, название, описание и длительность типа события;
- запись возможна только в пределах окна ближайших 14 дней от текущей даты;
- пересекающиеся бронирования запрещены глобально для всего календаря.

## MCP для OpenCode

В проекте настроен `Render MCP` для `OpenCode` через `opencode.jsonc`.

Что нужно локально:

- создать `Render API key` в настройках аккаунта Render;
- перед запуском `OpenCode` экспортировать переменную `RENDER_API_KEY`;
- не коммитить сам ключ в репозиторий.

Пример:

```bash
export RENDER_API_KEY=<your_render_api_key>
```

После перезапуска `OpenCode` можно использовать Render MCP-запросы, например:

- `Set my Render workspace to <WORKSPACE_NAME>`
- `List my Render services`

Существующий GitHub MCP по-прежнему использует `GITHUB_PAT`.

## Локальный запуск

### 1. Установить зависимости

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Сгенерировать OpenAPI из TypeSpec

```bash
npm run spec:build
```

OpenAPI будет собран в `.tsp-output/@typespec/openapi3/openapi.yaml`.

### 3. Запустить Prism mock API

```bash
npm run mock:prism
```

По умолчанию Prism слушает `http://127.0.0.1:4010`.

### 4. Запустить backend

```bash
npm run backend:dev
```

По умолчанию backend слушает `http://127.0.0.1:3000`.

В режиме локальной разработки frontend теперь ходит в backend через `/api`, а Vite проксирует эти запросы в backend.

Можно переопределить порт и origin для CORS:

```bash
PORT=3001 CORS_ORIGIN=http://127.0.0.1:5173 npm run backend:dev
```

### 5. Запустить frontend

```bash
npm run frontend:dev
```

По умолчанию Vite поднимает приложение на `http://127.0.0.1:5173`.
По умолчанию запросы `/api` будут проксироваться на `http://127.0.0.1:3000`.

### 6. Запустить Playwright e2e

Сначала один раз скачайте браузер Chromium от Playwright:

```bash
npm run e2e:install
```

Затем запустите e2e-тесты из корня репозитория:

```bash
npm run e2e
```

Во время запуска Playwright сам поднимет:

- backend на `http://127.0.0.1:3000`;
- frontend на `http://127.0.0.1:4173`;
- frontend будет обращаться в backend через `VITE_API_BASE_URL=/api`, а Vite проксирует `/api` в backend.

Это отдельный e2e-порт. Для обычной локальной разработки frontend по-прежнему запускается на стандартном Vite-порту `5173`, если вы стартуете его вручную.

По умолчанию локальный запуск идёт в `headless`-режиме, что удобно для Ubuntu внутри WSL.
Если нужен визуальный прогон, можно использовать:

```bash
npm run e2e:headed
```

## Переключение frontend между mock API и backend

Во frontend используется переменная окружения `VITE_API_BASE_URL`.

По умолчанию production и обычная локальная разработка используют same-origin путь `/api`.

Пример для Prism:

```bash
VITE_API_BASE_URL=http://127.0.0.1:4010 npm run frontend:dev
```

Пример для отдельно запущенного backend:

```bash
VITE_API_BASE_URL=/api VITE_DEV_API_TARGET=http://127.0.0.1:3000 npm run frontend:dev
```

Шаблон переменных лежит в `frontend/.env.example`.

## Production-схема

- frontend собирается в `frontend/dist`;
- backend запускается как один Node-процесс;
- API публикуется под префиксом `/api`;
- backend раздает статические файлы frontend и `index.html` для SPA-маршрутов;
- контейнер слушает HTTP-порт из переменной окружения `PORT`.

## Docker

### Сборка образа

```bash
docker build -t call-booking-calendar .
```

### Запуск контейнера

```bash
docker run --rm -p 3000:3000 -e PORT=3000 call-booking-calendar
```

После запуска приложение будет доступно на `http://127.0.0.1:3000`.
API будет доступно на `http://127.0.0.1:3000/api`.

## Деплой на Render

Рекомендуемая схема: один `Web Service` из GitHub-репозитория с использованием `Dockerfile`.

В репозитории также есть минимальный `render.yaml`, который можно использовать как Blueprint.

Что выбрать в Render Dashboard:

1. `New +` -> `Web Service`
2. Источник: GitHub-репозиторий `ai-for-developers-project-386`
3. Environment: `Docker`
4. Branch: нужная ветка
5. Build/Start команды вручную задавать не нужно, Render возьмет их из `Dockerfile`

Переменные окружения:

- `PORT` задавать вручную не нужно: Render подставит его сам;
- дополнительные переменные не обязательны для базового запуска.

После деплоя приложение получит публичный адрес вида:

```text
https://<service-name>.onrender.com
```

На этом URL будут доступны и frontend, и backend API:

- frontend: `https://<service-name>.onrender.com`
- API: `https://<service-name>.onrender.com/api`

## Что реализовано во frontend

- публичный список типов событий;
- страница типа события со списком свободных слотов и фильтром диапазона;
- форма создания бронирования;
- страница успешного бронирования;
- кабинет владельца с обзором;
- профиль владельца;
- список и создание типов событий;
- список и публикация окон доступности;
- список предстоящих бронирований.

## Что реализовано в backend

- `GET /api/owner/profile` — профиль преднастроенного владельца.
- `GET /api/owner/event-types` и `POST /api/owner/event-types` — чтение и создание типов событий.
- `GET /api/owner/availability-windows` и `POST /api/owner/availability-windows` — чтение и публикация окон доступности.
- `GET /api/owner/bookings/upcoming` — будущие подтверждённые бронирования.
- `GET /api/event-types` и `GET /api/event-types/{eventTypeId}` — публичное чтение типов событий.
- `GET /api/event-types/{eventTypeId}/slots` — вычисление свободных слотов внутри окна ближайших 14 дней.
- `POST /api/bookings` — создание бронирования с проверкой занятости на backend.
- при старте backend создаются два предопределённых типа встречи: `quick-call-15` и `standard-call-30`.
- при старте backend создаются окна доступности на ближайшие 3 дня, каждый день с `10:00` до `18:00` по UTC.

## Ключевые правила backend

- данные хранятся только в памяти процесса и сбрасываются после перезапуска;
- окна доступности не должны пересекаться, иначе backend возвращает `422 ValidationError`;
- слоты строятся из окон доступности, длительности типа события и уже существующих бронирований;
- занятость проверяется глобально для всего календаря, а не только внутри одного типа события;
- если слот уже занят, backend возвращает `409 Conflict` с кодом `booking_time_conflict`.

## Ограничения текущего шага

- Prism использует mock-ответы по OpenAPI и не хранит состояние между запросами.
- Backend хранит данные только в памяти процесса и сбрасывает их после перезапуска.
- Контракт не описывает аутентификацию, поэтому публичная и owner-части разведены только по маршрутам UI.

## E2E-покрытие

- Playwright размещён в корне репозитория, потому что сценарии проверяют сразу совместную работу `frontend` и `backend`.
- Тестовые данные для e2e создаются через реальные owner API backend, без специальных test-only endpoint'ов.
- Покрыты сценарии:
  - smoke-проверка загрузки приложения и данных из backend;
  - позитивный сценарий гостевого бронирования от списка событий до страницы успеха;
  - негативный сценарий конфликта слота с проверкой понятной ошибки в UI.
- Конфиг `playwright.config.ts` поднимает оба сервиса через `webServer`, использует Chromium и сохраняет `trace`, `screenshots`, `video` при сбоях.
- В CI используется workflow `.github/workflows/e2e.yml`, который ставит зависимости, браузер Playwright и запускает `npm run e2e` на `push` и `pull_request`.
