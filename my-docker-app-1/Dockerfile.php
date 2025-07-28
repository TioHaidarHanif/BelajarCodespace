FROM php:8.1-fpm-alpine 
WORKDIR /var/www/html # Direktori kerja di dalam kontainer
# Install ekstensi MySQLi yang diperlukan
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli
# Copy aplikasi PHP (akan di-mount oleh Docker Compose, jadi tidak perlu di-COPY di sini)
# COPY app/ .
