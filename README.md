# Memes Museum

Next.js 15 (App Router) application: digital museum for internet memes with exhibitions, ticketing, user profiles and admin panel.

## Стек

- Next.js 15 (app directory)
- TypeScript
- Tailwind CSS 4
- Drizzle ORM + PostgreSQL
- NextAuth (GitHub OAuth + credentials)
- SWR (частково для даних)
- Sentry (інтеграція готова, опціонально ввімкнути)
- Jest + React Testing Library
- OpenID Connect аутентифікації разом з password-based (self-hosted)

## Швидкий старт

1. Клонування

```
git clone <repo-url>
cd memes_museum
```

## 2. Environment

Створіть `.env` за прикладом .env.example.
(Якщо потрібно згенерувати секретний ключ: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`)

## 3. Запуск PostgreSQL

```
docker compose up -d
```

Перевірка: `docker compose ps` (повинен працювати контейнер postgres).

## 4. Прогнати міграції (створює таблиці згідно `db/schema.ts`):

```
npx drizzle-kit migrate
```

## 5. Запуск дев-сервера (варто враховувати, що він повільніший ніж продакшн):

```
npm install
npm run dev

```

`npm start` - для прод збірки

## 6. Відкрити http://localhost:3000

## 7. Логін / Адмін

У дампі вже створені користувачі, тому після завантаження даних можна буде увійти під наявними обліковими записами.

### Як запустити `.sql` дамп у базу

> Нижче приклад для PostgreSQL, що запущений у Docker, але команда працює і для локальної інсталяції.

1. Скопіюйте файл дампа `public_data.sql` у директорію, де будете виконувати команду.
2. Виконайте:
   `bash psql -U postgres -h localhost -d memes -f public_data.sql`
   Або в Докері:
   `docker exec -i memes-db psql -U postgres -d memes < public_data.sql`
   Або виконати всі INSERT команди через GUI-клієнт, наприклад, DBeaver.

Якщо треба створити admin вручну:

1. Отримати bcrypt-хеш:

```
node -e "const b=require('bcryptjs');b.hash('admin123',10).then(h=>console.log(h))"
```

2. Вставити:

```
INSERT INTO users(first_name,last_name,email,password_hash,role,created_at,updated_at)
VALUES ('Admin','User','admin@example.com','<HASH>','admin',NOW(),NOW());
```

3. Логін на /login через форму Credentials (email + пароль).

## Авторизація

- /login: GitHub OAuth + credentials (email/password).
- Middleware обмежує доступ до `/profile` (user|admin) та `/admin` (тільки admin).

## Функціонал (коротко)

### Гості (неавторизовані)

- Перегляд головної сторінки, сторінок виставок (public/published).
- Перегляд популярних мемів (masonry grid, випадковий мем).
- Покупка квитка без створення акаунта (вводять дані – генерується квиток + PDF / QR).
- Ознайомлення з правилами музею (модалка з accessibility).

### Авторизовані користувачі

- Все як гість + особистий кабінет `/profile`.
- Перегляд історії покупок (фільтри).
- Активні квитки: перегляд, завантаження / повторне завантаження PDF (генерація через `utils/generateTicketPDF.ts`).
- Редагування профілю: оновлення first_name / last_name (email незмінний).
- Залишення відгуку з прапорцем "allow_publish".

### Адмін

Адмін-панель у `/admin` (розділи можуть бути підсторінками):

- Виставки (`/admin/exhibitions`): створення, редагування, публікація (перевірка required), архівація, видалення, оптимістичне видалення, slug авто-генерація. Перетворення Markdown у сторінки постів.
- Тарифи / ціни квитків (`ticket_prices`): управління актуальними та майбутніми цінами (endpoints передбачені у схемі).
- Квитки: перегляд / фільтрація / управління статусом (active / cancelled / used).
- Мем-контент (API для мемів)

### Мем-галерея (деталі)

- 5 колонок Masonry.
- Skeleton overlay.
- Кнопка "Випадковий мем" звертається до `/api/memes/random`.

### Квитки / покупка

- Генерація унікального номера + QR (запис у таблиці `tickets`).
- PDF формується на льоту (jsPDF + шрифт Open Sans).
- Можливість придбати кілька квитків (+групові покупки з `purchases`).
