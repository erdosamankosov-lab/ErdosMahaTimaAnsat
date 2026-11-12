# №10 зертханалық жұмыс — Node.js, Express, REST API

**Дайындалған нұсқа: №7 — Курстар** (`name`, `teacher`, `credits`). Топ журналындағы нөмір көрсетілмегендіктен, мысал ретінде №7 таңдалды. Егер сіздің нұсқаңыз басқа болса, ресурс пен өрістерді соған сәйкестендіру қажет.

## Мақсаты
Express арқылы CRUD REST API жасау, маршруттарды, middleware-лерді, валидацияны, сүзгілеуді және HTTP күй кодтарын қолдану.

## Іске қосу
Node.js 18+ орнатылған болуы керек.

```bash
npm install
npm run dev
# немесе npm start
```

Сервер: `http://localhost:3000`.

## Эндпоинттер

| Әдіс | URL | Мақсаты | Сәтті код |
|---|---|---|---|
| GET | `/api/courses` | Тізім, `?search=web`, `?page=1&limit=2` | 200 |
| GET | `/api/courses/:id` | Бір курс | 200 |
| POST | `/api/courses` | Жаңа курс | 201 |
| PUT | `/api/courses/:id` | Толық жаңарту | 200 |
| PATCH | `/api/courses/:id` | Жартылай жаңарту (бонус) | 200 |
| DELETE | `/api/courses/:id` | Жою | 204 |

## curl тесттері (Linux, macOS, GitHub Codespaces)

```bash
curl -i http://localhost:3000/api/courses
curl -i 'http://localhost:3000/api/courses?search=web'
curl -i 'http://localhost:3000/api/courses?page=1&limit=2'
curl -i http://localhost:3000/api/courses/1
curl -i -X POST http://localhost:3000/api/courses -H 'Content-Type: application/json' -d '{"name":"Python","teacher":"Асқар Әлиев","credits":3}'
curl -i -X PUT http://localhost:3000/api/courses/1 -H 'Content-Type: application/json' -d '{"name":"Python Advanced","teacher":"Асқар Әлиев","credits":5}'
curl -i -X PATCH http://localhost:3000/api/courses/1 -H 'Content-Type: application/json' -d '{"credits":6}'
curl -i -X DELETE http://localhost:3000/api/courses/2
# Теріс жағдайлар
curl -i http://localhost:3000/api/courses/9999
curl -i -X POST http://localhost:3000/api/courses -H 'Content-Type: application/json' -d '{"name":"","teacher":"А","credits":"үш"}'
curl -i http://localhost:3000/api/unknown
```

## Жауап мысалдары

`GET /api/courses/1` → **200**:
```json
{"id":1,"name":"JavaScript негіздері","teacher":"Айгүл Нұрланқызы","credits":3}
```

`POST /api/courses` (Python мысалы) → **201**:
```json
{"id":4,"name":"Python","teacher":"Асқар Әлиев","credits":3}
```

`GET /api/courses/9999` → **404**:
```json
{"error":"Курс табылмады"}
```

Қате POST → **400**:
```json
{"error":"name бос емес мәтін болуы керек"}
```

`DELETE /api/courses/2` → **204**, жауап денесі бос.

## Middleware және бонус
- `express.json()` — JSON талдайды.
- Логгер — уақытты, HTTP әдісін және URL-ді көрсетеді.
- `validateCourse` — POST, PUT, PATCH деректерін тексереді.
- 404 және жалпы қате өңдеушісі бар.
- Бонус: PATCH, пагинация, CORS және `express.Router()`.
- Деректер массивте сақталады, сервер қайта іске қосылса қалпына келеді.

## Тестілеу және есеп

Тестілеу үшін `npm test` командасын орындаңыз немесе жоғарыдағы curl сұраныстарын пайдаланыңыз. Оқытушыға есеп тапсырғанда нақты орындалған сұраныстардың скриншоттарын (әдіс, URL, статус, жауап) тіркеңіз. `ЕСЕП_ҮЛГІСІ.md` файлын толтырыңыз.
