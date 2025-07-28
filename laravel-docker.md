-----

Baik, mari kita kembali ke awal dan jelaskan langkah-langkah detail menggunakan Docker untuk Laravel dari nol, fokus pada cara menjalankannya untuk pengembangan.

-----

## Step-by-Step Menggunakan Docker untuk Laravel

Kita akan membuat lingkungan pengembangan Laravel yang lengkap menggunakan Docker Compose, meliputi:

  * **Nginx**: Web server untuk melayani aplikasi Laravel Anda.
  * **PHP-FPM**: Prosesor PHP yang menjalankan kode Laravel.
  * **MySQL**: Database untuk aplikasi Laravel.
  * **Composer**: Untuk mengelola dependensi PHP.
  * **Artisan**: Untuk perintah Laravel (migrasi database, membuat controller, dll.).

### Prasyarat

Pastikan Anda sudah menginstal **Docker Desktop** (untuk Windows/macOS) atau **Docker Engine** (untuk Linux) di komputer Anda. Ini sudah termasuk Docker Compose.

-----

### Langkah 1: Buat Struktur Direktori Proyek

Pertama, buat folder utama untuk proyek Docker Laravel Anda. Kita akan menginstal Laravel di dalam subfolder `src` nanti.

```bash
mkdir laravel-docker-app
cd laravel-docker-app
```

Di dalam `laravel-docker-app`, buat folder untuk konfigurasi Docker kustom:

```bash
mkdir docker
mkdir docker/nginx
mkdir docker/php
mkdir src # Folder ini akan menampung kode Laravel Anda
```

Struktur folder Anda sekarang akan terlihat seperti ini:

```
laravel-docker-app/
├── docker/
│   ├── nginx/
│   └── php/
└── src/
```

-----

### Langkah 2: Buat File Konfigurasi Docker Kustom

Sekarang, kita akan mengisi folder `docker` dengan konfigurasi yang diperlukan.

#### A. Konfigurasi Nginx (`docker/nginx/default.conf`)

Buat file `default.conf` di dalam `docker/nginx/`:

```nginx
# docker/nginx/default.conf
server {
    listen 80; # Nginx akan mendengarkan di port 80 di dalam kontainer
    server_name localhost;

    root /var/www/html/public; # Direktori root aplikasi Laravel di dalam kontainer

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index.html index.htm index.php; # Urutan file index yang dicari

    charset utf-8;

    # Aturan routing utama untuk Laravel
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Penanganan PHP-FPM
    location ~ \.php$ {
        fastcgi_pass php:9000; # Meneruskan permintaan PHP ke service 'php' (PHP-FPM) di port 9000
        fastcgi_index index.php;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params; # Mengimpor parameter FastCGI default Nginx
    }

    # Mencegah akses ke file dotfiles tersembunyi (kecuali .well-known)
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### B. Dockerfile untuk PHP-FPM (`docker/php/Dockerfile`)

Buat file `Dockerfile` di dalam `docker/php/`:

```dockerfile
# docker/php/Dockerfile
FROM php:8.2-fpm-alpine # Menggunakan base image PHP 8.2 FPM yang ringan dengan Alpine Linux

WORKDIR /var/www/html # Mengatur direktori kerja default di dalam kontainer

# Menginstal dependensi sistem yang diperlukan (git, curl, mysql-client)
# dan ekstensi PHP yang umum digunakan oleh Laravel (pdo, pdo_mysql, opcache)
RUN apk add --no-cache \
    git \
    curl \
    mysql-client \
    && docker-php-ext-install pdo pdo_mysql opcache \
    && docker-php-ext-enable opcache

# Menginstal Composer secara global dari image Composer resmi
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Mengatur izin direktori untuk Laravel. Penting agar Laravel bisa menulis log dan cache.
# Mengubah user ID www-data agar cocok dengan user ID host (opsional, tapi membantu di macOS/Windows)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html \
    && usermod -u 1000 www-data

EXPOSE 9000 # Mendeklarasikan port 9000 akan didengarkan oleh PHP-FPM

CMD ["php-fpm"] # Perintah default yang dijalankan saat kontainer PHP-FPM dimulai
```

-----

### Langkah 3: Buat File `docker-compose.yml`

Ini adalah "cetak biru" yang akan mengatur semua service (kontainer) Anda. Buat file `docker-compose.yml` di **root direktori proyek Anda** (`laravel-docker-app/`):

```yaml
# docker-compose.yml
version: '3.8' # Versi sintaks Docker Compose

services:
  # --- 1. Nginx Web Server ---
  nginx:
    image: nginx:alpine # Menggunakan image Nginx versi Alpine (lebih ringan)
    ports:
      - "80:80" # Memetakan port 80 di host Anda ke port 80 di kontainer Nginx
    volumes:
      - ./src:/var/www/html # Mengikat folder 'src' lokal Anda ke '/var/www/html' di Nginx (untuk melayani aset statis)
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf # Mengikat file konfigurasi Nginx kustom
    depends_on:
      - php # Nginx akan dimulai setelah service 'php' dimulai

  # --- 2. PHP-FPM (Laravel Application) ---
  php:
    build:
      context: . # Konteks build adalah direktori root proyek (di mana docker-compose.yml berada)
      dockerfile: docker/php/Dockerfile # Menggunakan Dockerfile kustom kita untuk PHP-FPM
    volumes:
      - ./src:/var/www/html # Mengikat folder 'src' lokal Anda ke '/var/www/html' di PHP-FPM (tempat kode Laravel berada)
    expose:
      - 9000 # Mendeklarasikan bahwa PHP-FPM mendengarkan di port 9000 (untuk komunikasi dengan Nginx)

  # --- 3. MySQL Database ---
  mysql:
    image: mysql:8.0 # Menggunakan image MySQL versi 8.0 dari Docker Hub
    ports:
      - "3306:3306" # Opsional: Memetakan port 3306 di host ke port 3306 di kontainer MySQL (untuk akses dari tools eksternal seperti MySQL Workbench)
    environment: # Variabel lingkungan untuk konfigurasi MySQL awal
      MYSQL_ROOT_PASSWORD: your_root_password # **GANTI DENGAN SANDI KUAT!**
      MYSQL_DATABASE: laravel_db # Nama database yang akan dibuat
      MYSQL_USER: laravel_user # Nama user database Laravel
      MYSQL_PASSWORD: laravel_password # Password user database Laravel
    volumes:
      - db_data:/var/lib/mysql # Menggunakan volume bernama untuk persistensi data database MySQL

volumes: # Definisi volume bernama yang digunakan di atas
  db_data: # Volume bernama 'db_data' untuk menyimpan data MySQL secara persisten
```

-----

### Langkah 4: Instal Laravel di dalam Kontainer

Karena kita menggunakan Docker, kita akan menginstal Laravel *di dalam* kontainer PHP kita. Ini memastikan semua dependensi terinstal dengan benar di lingkungan kontainer.

1.  Buka terminal atau command prompt Anda dan navigasikan ke **root direktori proyek Anda** (`laravel-docker-app/`).

2.  Jalankan perintah berikut:

    ```bash
    docker compose run --rm php composer create-project laravel/laravel .
    ```

      * `docker compose run`: Menjalankan perintah satu kali di dalam kontainer service yang ditentukan.
      * `--rm`: Secara otomatis menghapus kontainer sementara setelah perintah selesai.
      * `php`: Menentukan bahwa perintah akan dijalankan di dalam kontainer service `php`.
      * `composer create-project laravel/laravel .`: Perintah Composer untuk menginstal Laravel. Titik (`.`) berarti instal di direktori kerja kontainer (`/var/www/html`), yang di-mount ke `src` lokal Anda.

    Proses ini mungkin memakan waktu beberapa menit karena Composer akan mengunduh semua dependensi Laravel. Setelah selesai, Anda akan melihat file-file Laravel terinstal di folder `src` lokal Anda.

-----

### Langkah 5: Konfigurasi Laravel untuk Database

Setelah Laravel terinstal, Anda perlu memberi tahu Laravel cara terhubung ke database MySQL yang berjalan di Docker.

1.  Buka file `.env` yang baru dibuat di dalam `src` Anda (misalnya `laravel-docker-app/src/.env`).

2.  Pastikan atau ubah baris-baris berikut agar sesuai dengan konfigurasi di `docker-compose.yml`:

    ```ini
    # laravel-docker-app/src/.env

    DB_CONNECTION=mysql
    DB_HOST=mysql # Ini adalah nama service database di docker-compose.yml
    DB_PORT=3306
    DB_DATABASE=laravel_db
    DB_USERNAME=laravel_user
    DB_PASSWORD=laravel_password
    ```

    **Penting:** `DB_HOST` harus `mysql` karena itu adalah nama service database di Docker Compose, bukan `localhost` atau IP.

3.  **Hasilkan `APP_KEY` Laravel:** Setiap aplikasi Laravel memerlukan `APP_KEY` yang unik untuk keamanan.

    ```bash
    docker compose run --rm php php artisan key:generate
    ```

    Perintah ini akan memperbarui `APP_KEY` di file `src/.env` Anda.

-----

### Langkah 6: Jalankan Migrasi Database

Sekarang, Anda bisa menjalankan migrasi Laravel untuk membuat tabel-tabel default database di MySQL.

```bash
docker compose run --rm php php artisan migrate
```

Perintah ini akan menggunakan kontainer `php` untuk menjalankan perintah Artisan `migrate`, yang akan terhubung ke kontainer `mysql` dan membuat tabel-tabel seperti `users`, `migrations`, `password_reset_tokens`, dll.

-----

### Langkah 7: Jalankan Aplikasi Laravel Anda\!

Semua persiapan sudah selesai. Sekarang saatnya untuk meluncurkan seluruh aplikasi Laravel Anda yang ditenagai Docker\!

Buka terminal di **root direktori proyek Anda** (`laravel-docker-app/`) dan jalankan:

```bash
docker compose up -d
```

  * `docker compose up`: Akan membaca `docker-compose.yml`, membangun image PHP jika ada perubahan, dan meluncurkan semua service (`nginx`, `php`, `mysql`).
  * `-d`: (detached mode) Menjalankan kontainer di latar belakang sehingga terminal Anda tetap bebas.

-----

### Langkah 8: Verifikasi Aplikasi

Setelah semua kontainer berjalan, buka browser web Anda dan kunjungi:

`http://localhost`

Anda seharusnya melihat halaman selamat datang Laravel 11\!

-----

### Perintah Docker Compose Berguna Lainnya:

  * **Melihat status kontainer yang berjalan:**
    ```bash
    docker compose ps
    ```
  * **Melihat log dari semua service (untuk debugging):**
    ```bash
    docker compose logs -f
    ```
    Anda juga bisa melihat log spesifik, contoh: `docker compose logs -f nginx`
  * **Menjalankan perintah Artisan Laravel:**
    ```bash
    docker compose run --rm php php artisan make:controller MyController
    docker compose run --rm php php artisan optimize:clear
    ```
    Anda bisa mengganti `php artisan make:controller MyController` dengan perintah Artisan Laravel apa pun.
  * **Mengakses shell di dalam kontainer:**
    ```bash
    docker compose exec php bash   # Masuk ke kontainer PHP
    docker compose exec mysql bash # Masuk ke kontainer MySQL
    ```
  * **Menghentikan semua service:**
    ```bash
    docker compose stop
    ```
  * **Menghentikan dan menghapus semua kontainer serta jaringan:**
    ```bash
    docker compose down
    ```
  * **Menghentikan, menghapus semua kontainer, jaringan, DAN VOLUME data (HATI-HATI: DATA DATABASE ANDA AKAN HILANG PERMANEN\!):**
    ```bash
    docker compose down -v
    ```

Dengan langkah-langkah ini, Anda kini memiliki lingkungan pengembangan Laravel yang terisolasi, konsisten, dan mudah diatur menggunakan Docker\! Selamat mencoba\!

Apakah ada bagian yang ingin Anda jelajahi lebih dalam?