# Automatic Deployment

Deployment target для цього Next.js проєкту - Vercel. Він автоматично створює preview deployments для Pull Requests і production deployment після merge в `main`. Прод-база даних живе на Neon.

## Target Flow

| Подія | Очікувана поведінка |
| --- | --- |
| Pull Request opened | Створюється preview deployment |
| Pull Request updated | Preview deployment оновлюється |
| Pull Request merged to `main` | Створюється production deployment |

## Початковий Vercel setup

1. Створити або відкрити Vercel team/project.
2. Import GitHub repository `Uplab-Education/clinic-booking-practice-2026`.
3. Вибрати Next.js framework preset.
4. Залишити build command:

```bash
npm run build
```

5. Додати environment variables (див. таблицю нижче) у Vercel Project Settings.
6. Перевірити, що Vercel створює preview deployments для Pull Requests.

## Environment Variables

| Variable | Required | Для чого |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Connection string до бази. На проді - Neon connection string (pooled). Локально - Docker-база з `.env.example` |
| `AUTH_SECRET` | Yes | Secret для signed session cookie. Довгий випадковий рядок, на проді - не той, що локально |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL для links/callbacks |

Не коміть реальні secrets. Реальні значення додаються в Vercel Project Settings і локальний `.env.local`.

## Прод-база даних на Neon

Прод-базу на [Neon](https://neon.com/docs/introduction) створює керівник практики. Міграції і seed на проді запускає ТІЛЬКИ керівник практики - практикантки не запускають жодних команд проти прод-бази.

Як це робить керівник:

```bash
DATABASE_URL=<neon-url> npx drizzle-kit migrate
DATABASE_URL=<neon-url> node --env-file-if-exists=.env.local src/db/seed.ts
```

Або простіше: тимчасово підставити Neon URL у `DATABASE_URL` в `.env.local`, запустити `npm run db:migrate` і `npm run db:seed`, після чого повернути локальний URL.

Preview deployments використовують ту саму прод-базу, що й production. Для навчальної практики це прийнятно: дані тестові, а окремі бази на кожен PR ускладнили б setup. Якщо захочеться ізоляції, Neon підтримує [database branching](https://neon.com/docs/introduction) - окрема копія бази на кожен preview - але це опція, не вимога.

## GitHub Actions і Deployment

GitHub Actions перевіряє якість коду: lint, typecheck, unit-тести і build. Vercel відповідає за deployment.

Branch protection для `main`:

- require a pull request before merging;
- require 1 approval від керівника практики;
- required status check: `Lint, typecheck, test, and build`;
- block direct pushes to `main`.

## Де дивитися результат

| Що потрібно | Де дивитися |
| --- | --- |
| CI result | GitHub PR checks |
| Preview URL | GitHub PR deployment section або Vercel dashboard |
| Build logs | Vercel deployment details |
| Production URL | Vercel project dashboard |

## Альтернативи

Якщо Vercel недоступний, можна використати Render, Railway або Fly.io. У такому разі потрібно оновити цей документ і environment variables до старту deployment-related задач.
