# docker/php/Dockerfile
FROM php:8.2-fpm-alpine 
WORKDIR /var/www/html # Mengatur direktori kerja default di dalam kontainer

# Install dependensi sistem dan ekstensi PHP yang umum digunakan oleh Laravel
RUN apk add --no-cache \
    git \
    curl \
    mysql-client \
    shadow \
    # Tambahkan paket lain jika proyek Anda membutuhkannya, misalnya:
    # imagemagick-dev \
    # && docker-php-ext-install gd \
    && docker-php-ext-install pdo pdo_mysql opcache \
    && docker-php-ext-enable opcache

# Instal Composer secara global
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Atur izin direktori (penting untuk Laravel)
# Pastikan user www-data memiliki akses tulis ke storage/ dan bootstrap/cache/
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html \
    && usermod -u 1000 www-data
EXPOSE 9000

CMD ["php-fpm"]