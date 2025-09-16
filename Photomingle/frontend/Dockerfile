# frontend/Dockerfile

# Использование конкретной версии alpine-образа node для детерминированности
FROM node:18.16.0-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем только package.json и package-lock.json для оптимизации кеша
COPY package*.json ./

# Устанавливаем зависимости, без кэша
RUN npm ci --silent

# Копируем остальной фронтенд код
COPY src /app/
COPY public /app/

# Создаем непривилегированного пользователя для безопасности
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Меняем владельца на нового пользователя
RUN chown -R appuser:appgroup /app

# Переключаемся на непривилегированного пользователя
USER appuser

# Экспортируем порт фронтенда
EXPOSE 3000

# Переменная для node окружения по умолчанию
ENV NODE_ENV=production

# Запуск с условием для режима разработки (hot-reload) и production
CMD [ "sh", "-c", "\
    if [ \"$DEBUG\" = \"True\" ]; then \
      npm run dev; \
    else \
      npm run build && npm run preview; \
    fi \
"]
