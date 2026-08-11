# Правила роботи в репозиторії

Цей репозиторій потрібен не тільки для розробки продукту, а й для навчання командного процесу. Майже кожна зміна має проходити через GitHub Issue, branch, Pull Request, automated checks і review від закріпленого керівника практики.

Коміти, назви branches і назви задач пишемо англійською. Пояснювальну документацію в репозиторії ведемо українською.

## Перед роботою

Цей файл - основна інструкція для практиканток. Починай з нього і повертайся сюди, коли працюєш з issue, branch, commit, Pull Request або review.

Перший крок - виконай свою onboarding issue. У ній є checklist для Git, Node.js, npm, Docker Desktop, VS Code, extensions і локального запуску.

## Onboarding

1. Відкрий свою onboarding issue на GitHub board.
2. Встанови інструменти з checklist в issue, включно з Docker Desktop.
3. Створи локальний `.env.local` на основі `.env.example`.
4. Запусти базу даних і проєкт локально за інструкцією з [README.md](README.md): `docker compose up -d`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`.
5. Прочитай цей файл до кінця.
6. Залиш comment в onboarding issue з версіями `git`, `node`, `npm` і `docker`.

Команда для `.env.local`:

```bash
cp .env.example .env.local
```

На Windows у PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Не коміть `.env.local` і не додавай реальні secrets у Pull Request.

Onboarding issue не потребує Pull Request, якщо в самій issue не написано інше.

Після onboarding бери product task тільки з колонки `Ready` свого треку: Track A - Patient Flow, Track B - Admin Flow.

## Корисна документація

Не потрібно знати всі ці технології напам'ять. Коли береш задачу, спочатку подивись на схожий код у репозиторії, а потім відкрий відповідну документацію.

| Якщо треба | Куди дивитися |
| --- | --- |
| Зрозуміти components, props, state, events, lists, conditional rendering | [React Learn](https://react.dev/learn) |
| Додати accessible UI primitive: menu, dialog, popover, tabs, tooltip | [Base UI components](https://base-ui.com/react/components) |
| Зрозуміти як складати Base UI parts у власний компонент | [Base UI composition](https://base-ui.com/react/handbook/composition) |
| Додати або змінити стилі через utility classes | [Tailwind CSS docs](https://tailwindcss.com/docs) |
| Розібратися з TypeScript types, unions, objects, functions | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) |
| Перевірити HTML/CSS basics або browser behavior | [MDN Web Docs](https://developer.mozilla.org/en-US/) |
| Зрозуміти App Router, pages, layouts, Server Actions | [Next.js App Router docs](https://nextjs.org/docs/app) |
| Написати або змінити database query чи схему | [Drizzle ORM docs](https://orm.drizzle.team/docs/overview) |
| Написати unit-тест | [Vitest guide](https://vitest.dev/guide/) |
| Зрозуміти, де живе прод-база | [Neon docs](https://neon.com/docs/introduction) |
| Розібратися з локальною базою в Docker | [Docker Compose docs](https://docs.docker.com/compose/) |

## Як додавати UI components

Спочатку перевір, чи в репозиторії вже є схожий компонент:

- `src/components/ui` - маленькі reusable components: `Button`, `PageHeader`, `StatCard`, `EmptyState`, icons. Ці компоненти вже готові - перевикористовуй їх, не копіюй і не пиши власні дублікати;
- `src/components` - більші application components, наприклад `app-shell.tsx` з навігацією за ролями;
- `src/app` - routes і page-level composition; компонент, який потрібен тільки одній сторінці, можна тримати поруч із нею.

Правила:

- не копіюй великий компонент у кілька місць;
- якщо компонент повторюється або буде повторюватися, винеси його в `src/components/ui` або `src/components`;
- для interactive primitives спочатку дивись Base UI, а не пиши behavior з нуля;
- для styling використовуй Tailwind classes, якщо немає вагомої причини додавати custom CSS;
- props описуй TypeScript type або interface;
- назва компонента має пояснювати, що він робить: `DoctorCard`, `SlotPicker`, `AppointmentList`.

Мінімальний приклад компонента:

```tsx
type DoctorCardProps = {
  fullName: string;
  specialty: string;
};

export function DoctorCard({ fullName, specialty }: DoctorCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">{fullName}</h3>
      <p className="mt-1 text-sm text-slate-600">{specialty}</p>
    </article>
  );
}
```

Перед тим як відкривати PR, перевір:

- компонент має зрозумілу назву;
- props typed;
- немає duplicated markup, який краще винести в компонент;
- UI виглядає нормально на desktop і mobile;
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` проходять.

## Server і Client Components

Коротке практичне правило для App Router:

- за замовчуванням усе - Server Components. Не додавай `"use client"`, якщо він не потрібен;
- `"use client"` потрібен тільки там, де є стан або події: форми, кнопки з обробниками, діалоги;
- дані читаються в Server Component (через функції з `src/db/queries`) і передаються пропсами вниз у клієнтські компоненти.

Анти-приклад, який ламає сторінку:

```tsx
"use client";

export function Greeting() {
  // ПОГАНО: сервер і клієнт отримають різні значення -> hydration mismatch
  const id = Math.random();
  const now = new Date().toLocaleTimeString();
  return <p>{id} {now}</p>;
}
```

`Math.random()`, `new Date()` та інші недетерміновані значення в рендері клієнтського компонента дають різний результат на сервері і в браузері - React впаде з hydration mismatch.

ЗАБОРОНЕНО "лікувати" це `isMounted`/`useEffect`-хаками або вимиканням SSR. Це маскує проблему, а не розв'язує її. Натомість:

- генеруй недетерміновані дані на сервері (у Server Component або Server Action) і передавай їх пропсами;
- або генеруй їх у event handler - код в обробнику події виконується тільки в браузері, тому mismatch неможливий.

Для дат і часу - тільки хелпери з `src/lib/availability.ts` (`formatSlotTime`, `formatDayLabel`, `formatAppointmentTime`). Вони працюють у фіксованій таймзоні `Europe/Kyiv`, тому сервер і клієнт завжди рендерять однаковий текст.

## Робота з базою даних

Схема і міграції:

- зміни схеми - тільки через `src/db/schema.ts`. Після зміни запусти `npm run db:generate` - drizzle-kit згенерує SQL-файл у `drizzle/`;
- закоміть згенерований SQL-файл разом зі зміною схеми в одному PR;
- НІКОЛИ не редагуй вже застосований файл міграції. Якщо треба щось змінити - зміни `schema.ts` і згенеруй нову міграцію;
- після `git pull` запусти `npm run db:migrate`, якщо в `drizzle/` з'явились нові міграції.

Локальні дані:

- `npm run db:seed` - деструктивний reset: truncate всіх таблиць і вставка тестових даних заново. Локально це нормально, запускай скільки завгодно;
- повний reset локальної бази, якщо щось пішло не так:

```bash
docker compose down -v
docker compose up -d
npm run db:migrate
npm run db:seed
```

Прод:

- практикантки НЕ запускають міграції на проді. Міграції і seed прод-бази робить тільки керівник практики (див. [docs/deployment.md](docs/deployment.md)).

Тести:

- unit-тести НЕ ходять у базу даних. Тестуємо чисті функції, наприклад логіку слотів у `src/lib/availability.ts`. Приклад - `src/lib/availability.test.ts`.

## GitHub Board

Board: `Clinic Booking Practice 2026`

Workflow:

```text
Issue -> Branch -> Pull Request -> Supervisor review -> CI -> Merge -> Deploy
```

Колонки на GitHub Project board:

| Колонка | Що означає |
| --- | --- |
| Backlog | Задача існує, але ще не готова до роботи |
| Ready | Задачу можна брати в роботу |
| In progress | Branch створена, робота почалась |
| In review | Pull Request відкритий |
| Changes requested | Керівник попросив правки |
| Done | PR merged, issue закрита |

Переміщуй issue тоді, коли змінюється її реальний статус. Не переміщуй задачу в `Done`, поки PR не merged.

Onboarding tasks можна закривати без Pull Request, якщо це прямо написано в issue.

Правила:

- не починай product task без GitHub issue;
- одна issue має одну основну branch і один Pull Request;
- issue переходить в `In review` тільки після відкриття PR;
- issue переходить в `Changes requested`, якщо керівник попросив правки;
- issue переходить в `Done` тільки після merge;
- approval дає закріплений керівник практики.

## Issues

Product task має містити:

- чітку назву;
- контекст;
- очікуваний результат;
- acceptance criteria;
- технічні notes, якщо потрібно;
- linked Pull Request, коли починається розробка.

Для нових задач використовуй template `.github/ISSUE_TEMPLATE/task.md`. Формальні сценарії, на які посилаються задачі, описані в [docs/use-cases.md](docs/use-cases.md).

## Branches

Одна issue = одна branch.

Формат:

```text
type/issue-number-short-description
```

`issue-number` - це РЕАЛЬНИЙ номер issue на GitHub, а не порядковий номер задачі у твоєму треку.

Приклади:

```text
feature/4-doctors-list
feature/9-booking-flow
test/14-availability-logic
fix/21-cancel-appointment-state
docs/17-update-readme
```

Назви branches пишемо lowercase, слова розділяємо дефісами.

## PR завжди відкривається в main

Base branch кожного Pull Request - `main`. Завжди. PR ніколи не відкривається в іншу feature-гілку.

Правильно:

```text
feature/9-booking-flow -> main
```

Неправильно:

```text
feature/9-booking-flow -> feature/4-doctors-list
```

Коли base branch - інша feature-гілка, у diff потрапляють чужі зміни, CI перевіряє не те, що поїде в продукт, а merge ламає історію.

Якщо випадково відкрила PR у іншу гілку - не закривай його. На сторінці PR натисни `Edit` поруч із назвою і в dropdown зміни base branch на `main`.

## Стандартний workflow задачі

Перейти на актуальну `main`:

```bash
git checkout main
git pull
```

Якщо після pull у `drizzle/` з'явились нові міграції:

```bash
npm run db:migrate
```

Створити branch для issue:

```bash
git checkout -b feature/4-doctors-list
```

Після змін подивитись статус:

```bash
git status
git diff
```

Запустити перевірки:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Додати зміни в commit:

```bash
git add .
git commit -m "Build doctors list page"
```

Відправити branch у GitHub:

```bash
git push -u origin feature/4-doctors-list
```

Після цього відкрий Pull Request у GitHub з твоєї branch у `main`.

## Commits

Commit messages пишемо англійською, коротко і конкретно.

Хороші приклади:

```text
Add doctors list page
Add free slot computation for weekly schedule
Fix cancelled appointment badge color
Update patient guide wording
```

Погані приклади:

```text
changes
fix
updates
final
```

## Pull Requests

Кожен PR має:

- лінкувати issue;
- відкриватися в `main` (див. розділ вище);
- пояснювати, що змінилося;
- описувати, як перевірити зміни;
- містити screenshots для UI-змін;
- проходити `lint`, `typecheck`, `test`, `build`;
- пройти review від закріпленого керівника практики.

Практикантки не approve-ять PR одна одної. Обговорювати код можна, але approval дає керівник практики.

## Як проходить рев'ю

Керівник практики рев'юїть PR через inline-коментарі до конкретних рядків і формальний вердикт GitHub: `Request changes` або `Approve`.

Кожен коментар має пріоритет:

| Пріоритет | Що означає | Приклади |
| --- | --- | --- |
| **P1** | Блокує merge. Треба виправити в цьому PR | Баги, зламані acceptance criteria, a11y-блокери, дубльований код замість наявного компонента |
| **P2** | Виправити бажано. Можна в цьому PR або окремим issue | Нейминг, дрібні покращення |

Як реагувати:

1. Прочитай усі коментарі.
2. Виправ P1 у тій самій branch. P2 - виправ або домовся про окреме issue.
3. Відповідай на кожен коментар: що зробила або чому пропонуєш інакше.
4. Натискай `Resolve` на коментарі тільки після фіксу.
5. Після всіх виправлень натисни `Re-request review` - без цього керівник не знає, що PR готовий до повторного review.

## Review Flow

1. Відкрий PR і перемісти issue в `In review`.
2. Дочекайся review від керівника.
3. Якщо є правки, перемісти issue в `Changes requested`.
4. Внеси правки в тій самій branch.
5. Запуш зміни:

```bash
git add .
git commit -m "Address review comments"
git push
```

6. Натисни `Re-request review` і перемісти issue назад в `In review`.
7. PR можна merge тільки після approval і green CI.

## Корисні Git-команди

Поточна branch і змінені файли:

```bash
git status
```

Історія commit-ів:

```bash
git log --oneline
```

Перемкнутися на іншу branch:

```bash
git checkout branch-name
```

Оновити свою branch змінами з `main`:

```bash
git checkout main
git pull
git checkout your-branch-name
git merge main
```

Скасувати незакомічені зміни в одному файлі:

```bash
git restore path/to/file.tsx
```

Не використовуй destructive commands на кшталт `git reset --hard`, якщо керівник практики прямо не попросив це зробити.

## Definition of Done

Product task можна закривати, коли:

- linked PR merged;
- acceptance criteria виконані;
- CI проходить;
- unit-тести зелені;
- керівник практики approve-нув PR;
- документація оновлена, якщо змінилась поведінка або setup.
