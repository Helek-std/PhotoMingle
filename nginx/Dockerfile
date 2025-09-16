# nginx/Dockerfile

FROM nginx:stable-alpine

# Копируем конфиг nginx в контейнер
COPY ./nginx.conf /etc/nginx/nginx.conf

# Сертификаты будут монтироваться через docker-compose volume (не копируем в образ)

# Открываем стандартные 80 и 443 порты
EXPOSE 80 443

# Запускаем nginx в foreground
CMD ["nginx", "-g", "daemon off;"]
