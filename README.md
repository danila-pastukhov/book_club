# book_club

> Django 5 + React 18 приложение для совместного чтения и обсуждения книг с системой геймификации

## Требования

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- MinIO (опционально, если используете S3-хранилище для медиа)

## Быстрый старт с нуля

### 1) Клонирование и переход в проект

```bash
git clone <repo-url>
cd book_club
```

### 2) Настройка backend

1. Перейдите в папку backend:

```bash
cd backend
```

2. Создайте и активируйте виртуальное окружение:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

3. Установите зависимости:

```bash
pip install -r requirements.txt
```

4. Создайте файл окружения `.env` рядом с `backend/manage.py` и заполните его:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=book_club
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# S3/MinIO (можно оставить по умолчанию для локального MinIO)
AWS_S3_ENDPOINT_URL=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_STORAGE_BUCKET_NAME=book-club-media
AWS_S3_USE_SSL=False
```

5. Подготовьте базу данных PostgreSQL:

- Создайте базу `book_club` и пользователя, указанные в `.env`.

6. Примените миграции:

```bash
python manage.py migrate
```

7. (Опционально) Создайте суперпользователя:

```bash
python manage.py createsuperuser
```

8. Запустите backend:

```bash
python manage.py runserver
```

Backend будет доступен на `http://localhost:8000/`.

### 3) Настройка frontend

1. Откройте новый терминал и перейдите в папку frontend:

```bash
cd frontend
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `frontend/.env`:

```env
VITE_BASE_URL=http://localhost:8000/
```

4. Запустите frontend:

```bash
npm run dev
```

Frontend будет доступен на `http://localhost:5174/`.

## MinIO (опционально)

Если вы хотите хранить EPUB/картинки в S3-совместимом хранилище локально:

1. Запустите MinIO (порт 9000).
2. Создайте bucket `book-club-media`.
3. Убедитесь, что значения в `.env` backend и `frontend/.env` соответствуют вашему MinIO.

## Полезные команды

Backend:

```bash
python manage.py test
```

Frontend:

```bash
npm run build
```

