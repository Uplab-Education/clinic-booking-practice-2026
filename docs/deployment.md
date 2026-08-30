# Automatic Deployment

Deployment target для цього Next.js проєкту - Vercel. Він автоматично створює preview deployments для Pull Requests і production deployment після merge в `main`. Прод-база даних живе на Neon.

## Target Flow

| Подія | Очікувана поведінка |
| --- | --- |
| Pull Request opened | Створюється preview deployment |
| Pull Request updated | Preview deployment оновлюється |
| Pull Request merged to `main` | Створюється production deployment |

## Поточний setup

| Що | Значення |
| --- | --- |
| Vercel scope | `uplab` (план Hobby) |
| Vercel project | `clinic-booking-practice-2026` |
| Production URL | https://clinic-booking-practice-2026.vercel.app |
| Git repository | `Uplab-Education/clinic-booking-practice-2026`, підключений до проєкту |
| Framework preset | Next.js, build command `npm run build` |
| Node.js version | 24.x |
| Function region | `fra1` (Франкфурт) |
| Прод-база | Neon resource `clinic-booking-db-eu`, регіон `fra1` (Франкфурт, `eu-central-1`) |

Function region і регіон бази мають збігатися. Сторінки рендеряться на сервері, тому запити до Postgres ідуть з регіону функції, а не з браузера користувача. Якщо рознести їх по континентах, кожен запит до бази додає ~90 мс, і це помітно навіть на простій сторінці зі списком лікарів.

Проєкт уже створений і підключений - повторювати setup не треба. Нижче описано, як він влаштований, щоб можна було відтворити або полагодити.

## Environment Variables

| Variable | Required | Звідки береться | Де встановлено |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Автоматично від Neon-інтеграції (pooled connection string) | Production, Preview |
| `DATABASE_URL_UNPOOLED` | No | Автоматично від Neon-інтеграції (direct connection) | Production, Preview |
| `AUTH_SECRET` | Yes | Згенерований випадковий рядок, позначений як sensitive | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL для links/callbacks | Production |

Neon-інтеграція додає ще набір `POSTGRES_*` і `PG*` змінних - застосунок їх не використовує, вони приходять у комплекті.

Environment `Development` навмисно не підключений до Neon: локально розробка йде проти Docker-бази з `.env.example`, і прод-креденшели на машини практиканток не потрапляють.

Не коміть реальні secrets. Реальні значення живуть у Vercel Project Settings і локальному `.env.local`.

## Прод-база даних на Neon

Базу створено через Vercel Marketplace (Storage -> Neon), тому вона керується з того ж Vercel-акаунта і окремий акаунт на neon.com не потрібен. План Free: 0.5 GB сховища, автопризупинення після 5 хвилин простою.

Міграції і seed на проді запускає ТІЛЬКИ керівник практики - практикантки не запускають жодних команд проти прод-бази.

Як це робить керівник:

```bash
# Витягнути прод-змінні у тимчасовий файл (НЕ у .env.local - його перезапише)
vercel --scope uplab env pull /tmp/prod.env --environment production

# Міграції - через unpooled connection, DDL погано дружить з пулером
export DATABASE_URL=$(grep '^DATABASE_URL_UNPOOLED=' /tmp/prod.env | cut -d= -f2- | tr -d '"')
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON src/db/migrate.ts

# Seed - УВАГА: TRUNCATE усіх таблиць перед вставкою
node --env-file=/tmp/prod.env src/db/seed.ts

rm /tmp/prod.env
```

Seed повністю скидає дані, тому запускати його на проді можна тільки свідомо - це шлях повернутися до відомого стану, а не звичайна операція.

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
| Production URL | https://clinic-booking-practice-2026.vercel.app |
| Vercel dashboard | https://vercel.com/uplab/clinic-booking-practice-2026 |

## Альтернативи

Якщо Vercel недоступний, можна використати Render, Railway або Fly.io. У такому разі потрібно оновити цей документ і environment variables до старту deployment-related задач.
