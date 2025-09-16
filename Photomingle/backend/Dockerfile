
# Используем slim образ с конкретной версией Python для детерминизма
FROM python:3.11.5-slim

# Устанавливаем переменную для записи логов сразу в stdout/stderr
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Установка системных зависимостей для psycopg2, gcc и прочих сборок, с очисткой кэша
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копируем только файл зависимостей для кеширования установки
COPY requirements.txt /app/

# Установка python-зависимостей с отключением кэша pip
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь backend код после установки зависимостей (чтобы использовать кэш Docker)
COPY . /app/

# Добавляем не-root пользователя для безопасности (UID 1000 - пример)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Меняем права на папку проекта
RUN chown -R appuser:appgroup /app

# Переключаемся на не-root пользователя
USER appuser

# Открываем порт приложения
EXPOSE 8000

# Команда запуска с поддержкой горячей перезагрузки при DEBUG=True
CMD [ "sh", "-c", "\
    if [ \"$DEBUG\" = \"True\" ]; then \
        python manage.py runserver 0.0.0.0:8000; \
    else \
        gunicorn Photomingle.wsgi:application --bind 0.0.0.0:8000 --workers 3 --threads 3 --timeout 120; \
    fi \
"]
