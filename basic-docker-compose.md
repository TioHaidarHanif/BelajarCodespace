Tentu\! Mari kita pelajari cara menggunakan Docker Compose langkah demi langkah. Docker Compose sangat powerful untuk mengelola aplikasi yang terdiri dari banyak kontainer (misalnya, aplikasi web, database, cache, dll.).

Kita akan membuat aplikasi web sederhana yang terdiri dari:

1.  **Aplikasi Web (PHP/Nginx)**: Aplikasi PHP sederhana yang disajikan oleh Nginx.
2.  **Database (MySQL)**: Tempat penyimpanan data.

### **Prasyarat:**

Sebelum memulai, pastikan Anda telah menginstal:

  * **Docker Desktop** (untuk Windows/macOS) atau **Docker Engine** (untuk Linux). Ini sudah termasuk Docker Compose.

### **Langkah 1: Buat Struktur Direktori Proyek**

Buat sebuah folder untuk proyek Anda, misalnya `my-docker-app`. Di dalamnya, kita akan buat subfolder dan file:

```
my-docker-app/
├── app/
│   └── index.php
├── nginx/
│   └── default.conf
└── docker-compose.yml
```

### **Langkah 2: Buat File Aplikasi (PHP)**

Di dalam folder `app/`, buat file `index.php` dengan isi berikut:

```php
<?php
// app/index.php
$servername = "db"; // Nama host 'db' sesuai dengan nama service di docker-compose.yml
$username = "user";
$password = "password";
$dbname = "mydb";

// Buat koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
echo "<h1>Halo dari Aplikasi Docker!</h1>";
echo "<p>Koneksi ke database MySQL berhasil!</p>";

// Contoh query sederhana (opsional, jika Anda ingin benar-benar berinteraksi)
// $sql = "CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, text VARCHAR(255))";
// if ($conn->query($sql) === TRUE) {
//     echo "<p>Tabel 'messages' berhasil dibuat atau sudah ada.</p>";
// } else {
//     echo "<p>Error membuat tabel: " . $conn->error . "</p>";
// }

$conn->close();
?>
```

### **Langkah 3: Buat Konfigurasi Nginx**

Di dalam folder `nginx/`, buat file `default.conf` dengan isi berikut:

```nginx
# nginx/default.conf
server {
    listen 80;
    index index.php index.html;
    root /var/www/html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        # 'php' adalah nama service PHP-FPM di docker-compose.yml
        fastcgi_pass php:9000; 
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
}
```

### **Langkah 4: Buat File `docker-compose.yml`**

Ini adalah inti dari setup kita. Di direktori `my-docker-app/`, buat file `docker-compose.yml` dengan isi berikut:

```yaml
# docker-compose.yml
version: '3.8' # Versi Docker Compose

services:
  # Service untuk aplikasi PHP (PHP-FPM)
  php:
    build:
      context: . # Konteks build adalah direktori saat ini (my-docker-app/)
      dockerfile: Dockerfile.php # Nama Dockerfile yang akan kita buat
    volumes:
      - ./app:/var/www/html # Mount folder 'app' lokal ke dalam kontainer
    expose:
      - 9000 # PHP-FPM mendengarkan di port 9000

  # Service untuk web server Nginx
  web:
    image: nginx:latest # Menggunakan image Nginx resmi dari Docker Hub
    ports:
      - "80:80" # Map port 80 dari host ke port 80 di kontainer
    volumes:
      - ./app:/var/www/html # Mount folder 'app' lokal ke dalam kontainer
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf # Mount file konfigurasi Nginx
    depends_on:
      - php # Service 'web' bergantung pada 'php', jadi 'php' akan dimulai duluan

  # Service untuk database MySQL
  db:
    image: mysql:8.0 # Menggunakan image MySQL resmi
    environment:
      MYSQL_ROOT_PASSWORD: root_password # Password root database
      MYSQL_DATABASE: mydb # Nama database yang akan dibuat
      MYSQL_USER: user # Nama user database
      MYSQL_PASSWORD: password # Password user database
    volumes:
      - db_data:/var/lib/mysql # Volume persisten untuk data database
    ports:
      - "3306:3306" # Opsional: Jika Anda ingin mengakses MySQL dari host

volumes:
  db_data: # Definisi volume untuk data MySQL
```

### **Langkah 5: Buat Dockerfile untuk PHP**

Karena kita menggunakan `build: context: .` dan `dockerfile: Dockerfile.php` untuk service `php`, kita perlu membuat Dockerfile khusus untuk PHP.

Di direktori `my-docker-app/`, buat file `Dockerfile.php` dengan isi berikut:

```dockerfile
# Dockerfile.php
FROM php:8.1-fpm-alpine # Menggunakan base image PHP-FPM dengan Alpine Linux

WORKDIR /var/www/html # Direktori kerja di dalam kontainer

# Install ekstensi MySQLi yang diperlukan
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Copy aplikasi PHP (akan di-mount oleh Docker Compose, jadi tidak perlu di-COPY di sini)
# COPY app/ . 
```

### **Langkah 6: Jalankan Aplikasi Menggunakan Docker Compose**

Sekarang, buka terminal/command prompt Anda, navigasikan ke direktori `my-docker-app/` (tempat `docker-compose.yml` berada), lalu jalankan perintah berikut:

```bash
docker compose up -d
```

  * `docker compose up`: Perintah ini akan membaca file `docker-compose.yml`, membangun image yang diperlukan (dalam kasus ini, image PHP dari `Dockerfile.php`), dan kemudian membuat serta menjalankan semua kontainer yang didefinisikan (`php`, `web`, `db`).
  * `-d`: (detached mode) Menjalankan kontainer di latar belakang sehingga terminal Anda tetap bebas.

Anda akan melihat output yang menunjukkan proses build dan startup kontainer.

### **Langkah 7: Verifikasi Aplikasi**

Setelah semua kontainer berjalan, buka browser web Anda dan kunjungi:

`http://localhost`

Anda seharusnya melihat pesan:
"Halo dari Aplikasi Docker\!
Koneksi ke database MySQL berhasil\!"

Jika ada masalah, Anda bisa memeriksa log kontainer:

```bash
docker compose logs
```

Atau melihat status kontainer:

```bash
docker compose ps
```

### **Langkah 8: Hentikan dan Hapus Aplikasi**

Setelah selesai bereksperimen, Anda bisa menghentikan dan menghapus semua kontainer serta network yang dibuat oleh Docker Compose:

```bash
docker compose down
```

  * `docker compose down`: Menghentikan dan menghapus kontainer dan jaringan yang didefinisikan dalam `docker-compose.yml`.
  * Jika Anda juga ingin menghapus volume data (`db_data` dalam kasus ini), tambahkan `-v`:
    ```bash
    docker compose down -v
    ```
    **Hati-hati:** Ini akan menghapus semua data di database Anda.

### **Penjelasan Konsep Utama Docker Compose:**

  * **`version`**: Menentukan versi sintaks file Compose. `3.8` adalah versi yang umum dan direkomendasikan.
  * **`services`**: Bagian utama di mana Anda mendefinisikan semua kontainer yang membentuk aplikasi Anda. Setiap kunci di bawah `services` (misalnya `php`, `web`, `db`) adalah nama untuk layanan/kontainer tersebut.
      * **`build`**: Memberi tahu Docker Compose untuk membangun image dari Dockerfile.
          * `context: .`: Menentukan lokasi file Dockerfile dan semua file yang relevan untuk build (dalam kasus ini, direktori saat ini).
          * `dockerfile: Dockerfile.php`: Secara eksplisit menentukan nama Dockerfile yang akan digunakan (jika bukan `Dockerfile` standar).
      * **`image`**: Jika Anda tidak membangun image sendiri, Anda dapat menentukan image yang sudah ada dari Docker Hub (misalnya `nginx:latest`, `mysql:8.0`).
      * **`ports`**: Memetakan port dari host ke kontainer. `  "80:80" ` berarti port 80 di host Anda akan terhubung ke port 80 di dalam kontainer `web`.
      * **`expose`**: Mendeklarasikan port yang mendengarkan di dalam kontainer. Port ini hanya dapat diakses oleh kontainer lain di jaringan Compose yang sama (tidak dari host secara langsung kecuali ada `ports` juga).
      * **`volumes`**: Membuat persistensi data atau berbagi file antara host dan kontainer.
          * `./app:/var/www/html`: Mengikat (bind mount) direktori `app` lokal Anda ke `/var/www/html` di dalam kontainer. Ini berguna untuk development karena perubahan kode di host akan langsung terlihat di kontainer.
          * `db_data:/var/lib/mysql`: Menggunakan "named volume" (`db_data`) untuk menyimpan data database secara persisten di luar kontainer, sehingga data tidak hilang saat kontainer dihapus.
      * **`environment`**: Menetapkan variabel lingkungan di dalam kontainer. Ini sering digunakan untuk konfigurasi sensitif seperti kredensial database.
      * **`depends_on`**: Menentukan dependensi antar layanan. Misalnya, `web` bergantung pada `php` berarti Docker Compose akan memastikan `php` dimulai sebelum `web`. Ini TIDAK berarti `php` sepenuhnya siap menerima koneksi, hanya bahwa prosesnya sudah dimulai. Untuk dependensi yang lebih kuat (menunggu layanan siap), Anda mungkin perlu alat eksternal atau skrip startup.
  * **`volumes`**: Bagian terpisah di akhir file untuk mendefinisikan named volumes yang akan digunakan oleh layanan Anda (misalnya `db_data`).

Ini adalah dasar-dasar penggunaan Docker Compose. Dengan ini, Anda dapat mulai mengorkestrasi aplikasi multi-kontainer Anda sendiri\!
===========
Penjelasaan
yang aku pahami terkait mount kiu kita nyambungin yang ada  di komputer kita ke yang ada di docker

jadi gimana caranya yang ada di docker itu sama dengan yang ada di komputger kita
dengan mount
- ./app:/var/www/html

./app itu yang di lokal kita, dan var... itu ada di docker. jadi setiap perubahan yang ada di /app, maka akan nyaguh yang ada di dalem var... tanpa harus nge buat ulang

expose itu untuk mendelkarasikan posrt mana yang digunakan untuk komunikasi

port 90:80 => 90 itu berarti port di komputer, sedangkan 80 itu port dari container
