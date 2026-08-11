# Архітектура проєкту

Репозиторій уже має підготовлений Next.js App Router product shell. У ньому є layout, credentials authentication, role-based navigation, схема бази даних із міграціями і seed data, готові database queries, чисті функції для роботи зі слотами і shared UI components. Це дозволяє практиканткам фокусуватися на product tasks і командному workflow, а не на базовому setup.

## Структура

```text
src/
  app/                    сторінки (App Router) + api/auth/* роути
    doctors/              список лікарів
    doctors/[doctorId]/   сторінка лікаря і вільні слоти
    appointments/         записи пацієнта
    admin/                адмінський dashboard
    admin/doctors/        керування лікарями
    admin/schedules/      тижневі розклади
    admin/appointments/   всі записи клініки
    login/, register/     сторінки auth
  auth/
    session.ts            підписана HTTP-only cookie
    users.ts              робота з користувачами
    guards.ts             requireUser / requireAdmin
    passwords.ts          хешування паролів (scrypt)
    auth-provider.tsx     client-side auth context
  components/
    app-shell.tsx         навігація за ролями
    ui/                   Button, PageHeader, StatCard, EmptyState, icons
    auth/auth-form.tsx    спільна форма login/register
  db/
    schema.ts             єдине джерело правди для таблиць і типів
    client.ts             лінивий getDb() (drizzle + postgres.js)
    seed.ts               тестові дані
    errors.ts             SlotTakenError, InvalidSlotError, isUniqueViolation
    queries/              users.ts, doctors.ts, schedules.ts, appointments.ts
  lib/
    cn.ts                 обʼєднання Tailwind classes
    availability.ts       чисті функції дат і слотів
    availability.test.ts  приклад unit-тесту
drizzle/                  згенеровані SQL-міграції (комітяться)
docker-compose.yml        локальний PostgreSQL 17
```

Компоненти в `src/components/ui` і запити в `src/db/queries` - ГОТОВІ будівельні блоки. Перед тим як писати нове, перевір, чи потрібне вже існує. Перевикористовуй, не копіюй.

## Як проходить request

Читання даних:

```text
Server Component -> функція з src/db/queries -> Drizzle -> Postgres
```

Сторінка (Server Component) викликає готову функцію з `src/db/queries`, та через Drizzle йде в Postgres, результат передається пропсами вниз у компоненти.

Мутації (запис на прийом, скасування, зміни в адмінці) - через Server Actions, які викликають ті самі функції з `src/db/queries`.

## Функціональні зони

| Зона | Приклади | Статус |
| --- | --- | --- |
| Auth | Registration, login, logout, session, role guards | Готова, не чіпаємо |
| Doctors | Список лікарів, сторінка лікаря, спеціальності | Product tasks |
| Booking | Вільні слоти, запис на прийом | Product tasks |
| Appointments | Мої записи, скасування | Product tasks |
| Admin | Керування лікарями, розкладами, перегляд усіх записів | Product tasks |

Формальні сценарії для цих зон описані в [docs/use-cases.md](use-cases.md) - UC-1..UC-10.

## Правила архітектури

1. **Усі DB-запити живуть у `src/db/queries`.** Сторінки і Server Actions їх лише викликають. Жодного drizzle-коду в компонентах або сторінках.
2. **Типи імпортуються з `src/db/schema.ts`.** Схема - єдине джерело правди для таблиць і типів. Не дублюй типи вручну.
3. **Чисті функції дат і слотів - лише з `src/lib/availability.ts`** (`computeFreeSlots`, `generateSlotTimes`, `groupSlotsByDay`, `clinicDateTime`). Форматування дат - тільки хелперами `formatSlotTime`, `formatDayLabel`, `formatAppointmentTime`. Вони працюють у фіксованій таймзоні `CLINIC_TIME_ZONE = Europe/Kyiv` - інакше сервер і браузер відрендерять різний текст і буде hydration mismatch.
4. **Функціональні зони:** Auth (готова), Doctors, Booking, Appointments, Admin. Один PR працює в межах однієї зони і однієї issue.

## База даних

Локально база працює в Docker (`docker compose up -d`, порт `5433`), на проді - Neon. Схема визначається в `src/db/schema.ts`, міграції генеруються через `npm run db:generate` і комітяться в `drizzle/`.

Таблиці, зв'язки і деталі схеми описані в [docs/database.md](database.md). Процес роботи з міграціями і seed - у розділі "Робота з базою даних" в [CONTRIBUTING.md](../CONTRIBUTING.md).

## Правила розробки

- Один PR має бути сфокусований на одній issue.
- Не замінювати credentials auth на інший auth provider без окремої reviewed issue.
- Не додавати інші UI libraries, ORM або testing frameworks без окремої задачі.
- Reusable UI тримати в `src/components/ui` і `src/components`.
- Unit-тестами покриваємо чисті функції (`src/lib`), тести не ходять у базу.
- Оновлювати цей документ, якщо змінюються архітектурні рішення.

## Starter Auth

Auth уже готовий і навмисно невеликий:

- seed admin: `admin@clinic.test` / `password`;
- seed patients: `olena@patient.test`, `taras@patient.test` / `password`;
- signed HTTP-only session cookie (`src/auth/session.ts`);
- паролі хешуються scrypt (`src/auth/passwords.ts`);
- route handlers для login, register, logout і session lookup (`src/app/api/auth`);
- guards для сторінок: `requireUser` і `requireAdmin` (`src/auth/guards.ts`).

Це дозволяє працювати з patient/admin flows без OAuth і сторонніх auth providers.
