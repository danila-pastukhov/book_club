# book_club

> Django 5 + React 18 приложение для совместного чтения и обсуждения книг с системой геймификации

## MinIO (S3) для медиа

Добавьте переменные окружения для backend (рядом с backend/manage.py):

- AWS_S3_ENDPOINT_URL=http://localhost:9000
- AWS_ACCESS_KEY_ID=minioadmin
- AWS_SECRET_ACCESS_KEY=minioadmin
- AWS_STORAGE_BUCKET_NAME=book-club-media
- AWS_S3_REGION_NAME=us-east-1
- AWS_S3_ADDRESSING_STYLE=path
- AWS_S3_USE_SSL=false
- AWS_S3_VERIFY=true

После этого все поля `FileField`/`ImageField` будут сохраняться в MinIO.

