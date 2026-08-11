# Clinic Booking Practice 2026

Репозиторій для проєктно-технологічної практики. Продукт: вебзастосунок онлайн-запису пацієнтів до приватної клініки. Пацієнт переглядає лікарів і вільні слоти, записується на прийом, бачить свої записи і може їх скасувати. Адміністратор клініки керує лікарями, тижневими розкладами і переглядає всі записи. Гість бачить лендінг і може зареєструватися - після реєстрації він стає пацієнтом.

Окрім продукту, цей репозиторій використовується для навчання командного процесу: GitHub board, issues, branches, pull requests, code review, CI checks і automatic deployment.

Команда: 2 практикантки і закріплений керівник практики. Робота розділена на два треки: Track A - Patient Flow, Track B - Admin Flow.

## Технології

| Частина | Рішення |
| --- | --- |
| Мова | TypeScript (strict) |
| Framework | Next.js 16 App Router + React 19 |
| UI primitives | Base UI (`@base-ui/react`) |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL 17 (Docker Compose локально, Neon на проді) |
| ORM | Drizzle ORM (драйвер postgres.js) |
| Unit tests | Vitest |
| Package manager | npm 11+ |
| Runtime | Node.js 24+ (`.nvmrc`) |
| CI | GitHub Actions |
| Deployment | Vercel |

У репозиторії вже є базовий layout, credentials authentication, role-based navigation, схема бази даних, готові queries, seed data і shared UI components. Це дозволяє одразу працювати над product tasks, а не над setup.

## Стартові облікові записи

Seed data створює тестові акаунти. Пароль для всіх: `password`.

| Role | Email |
| --- | --- |
| Admin | `admin@clinic.test` |
| Patient | `olena@patient.test` |
| Patient | `taras@patient.test` |

Крім акаунтів, seed створює 4 спеціальності, 6 лікарів (1 деактивований), тижневі розклади і 7 записів на прийом (1 скасований).

Auth використовує signed HTTP-only session cookie.

## Локальний запуск

Для локальної бази даних потрібен [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up -d
cp .env.example .env.local
nvm use
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Покроково:

1. `docker compose up -d` - піднімає PostgreSQL 17 у Docker. База слухає порт `5433`, щоб не конфліктувати з іншими локальними Postgres.
2. `cp .env.example .env.local` - створює локальний env-файл. Локальний `DATABASE_URL` уже вказує на Docker-базу: `postgresql://postgres:postgres@localhost:5433/clinic_booking`. Реальні secrets не комітимо.
3. `npm install` - встановлює залежності.
4. `npm run db:migrate` - застосовує SQL-міграції з `drizzle/`.
5. `npm run db:seed` - наповнює базу тестовими даними. Команда деструктивна: вона повністю скидає локальні дані і вставляє їх заново. Локально це нормально, її можна запускати скільки завгодно.
6. `npm run dev` - запускає dev server.

Відкрити:

```text
http://localhost:3000
```

## Перевірки перед Pull Request

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Корисні npm scripts

| Script | Що робить |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Unit-тести (Vitest) |
| `npm run db:generate` | Генерує SQL-міграцію зі змін у `src/db/schema.ts` |
| `npm run db:migrate` | Застосовує міграції |
| `npm run db:seed` | Деструктивний reset локальних даних |
| `npm run db:studio` | Drizzle Studio - переглянути дані в браузері |

## Як працюємо

Коротко: кожна product task проходить через `Issue -> Branch -> Pull Request -> Review -> CI -> Merge`.

Правила, команди, приклади і статуси GitHub board описані в [CONTRIBUTING.md](CONTRIBUTING.md).

## Для практиканток

Починати тут:

1. Прочитати [CONTRIBUTING.md](CONTRIBUTING.md).
2. Виконати свою onboarding issue.
3. Після onboarding взяти product task зі свого треку з GitHub board.
4. Працювати за правилами з `CONTRIBUTING.md`.

## Документи

| Документ | Для чого |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Основна інструкція для практиканток: onboarding, Git, issues, branches, commits і Pull Requests |
| [docs/architecture.md](docs/architecture.md) | Архітектура проєкту і правила розробки |
| [docs/database.md](docs/database.md) | Схема бази даних, таблиці і зв'язки |
| [docs/use-cases.md](docs/use-cases.md) | Формальні сценарії використання (UC-1..UC-10) |
| [docs/deployment.md](docs/deployment.md) | Як працює automatic deployment |

## Definition of Done

Product task готова, коли є linked issue, окрема branch, Pull Request з описом змін, green CI (lint, typecheck, unit-тести і build зелені), approval керівника практики і потрібні оновлення документації.
