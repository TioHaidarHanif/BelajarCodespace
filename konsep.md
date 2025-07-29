### Proxy

proxy adalah server yang bertindak sebagai perantara untuk permintaan dari klien yang mencari sumber daya dari server lain.

Reverse Proxy adalah server yang menerima permintaan dari klien atas nama server lain (server backend) dan kemudian meneruskan respons dari server backend kembali ke klien.

Forward Proxy: Bekerja untuk klien. Klien yang "mencari" dan "menggunakan" proxy untuk mengakses sumber daya keluar ke internet. Arahnya "maju" atau "keluar".

Klien (internal) -> Proxy (internal) -> Server Tujuan (eksternal)

Reverse Proxy: Bekerja untuk server. Server yang "menyediakan" proxy agar klien dapat mengaksesnya dari luar (internet). Arahnya "kembali" atau "masuk".

Klien (eksternal) -> Proxy (eksternal) -> Server Tujuan (internal)

Singkatnya, forward proxy melindungi dan memfasilitasi klien (pengguna) dalam mengakses internet, sedangkan reverse proxy melindungi dan memfasilitasi server (aplikasi) agar dapat diakses oleh klien dari internet. Arah "layanan" atau "perlindungan"nya terbalik.

#### Host
Ini adalah tiga istilah fundamental dalam dunia web dan komputasi, dan seringkali orang bingung atau menggunakannya secara bergantian. Padahal, ada perbedaan konsep yang jelas.

Mari kita jelaskan satu per satu:

1. Host
Host (dalam konteks umum) adalah komputer atau perangkat apa pun yang **terhubung ke jaringan dan dapat berkomunikasi dengan perangkat lain** di jaringan tersebut. Setiap kali Anda terhubung ke internet, komputer atau smartphone Anda bertindak sebagai host (atau client host).

Dalam konteks web dan hosting, host sering kali merujuk pada penyedia layanan yang menyediakan ruang di server agar situs web atau aplikasi Anda bisa diakses secara online. Ini juga bisa merujuk pada server fisik itu sendiri yang "menghosting" atau "menjadi tuan rumah" bagi aplikasi atau situs web.

Kegunaan/Makna Utama Host:

- Entitas Fisik/Logis di Jaringan: Bisa berupa komputer pribadi, server, router, atau bahkan ponsel yang memiliki alamat IP dan terhubung ke jaringan.

- Penyedia Layanan: Ketika Anda membeli "web hosting", Anda membeli layanan dari penyedia yang "menghosting" situs web Anda di server mereka.

- Identitas Jaringan: Dalam header HTTP, Host header (misalnya, Host: www.example.com) mengidentifikasi nama domain yang diminta oleh klien. Ini penting untuk Virtual Host di Nginx.

Contoh: Komputer Anda adalah host. Server yang menyimpan file situs web Anda adalah host.

Setiap server (baik itu web server, database server, atau application server) harus berjalan di atas sebuah host.

Program-program server (misalnya, program Nginx, program MySQL) diinstal dan dijalankan di sebuah host.

Host: Adalah entitas fisik atau virtual yang menyediakan lingkungan dan sumber daya dasar.

Server: Adalah program perangkat lunak yang berjalan di atas host dan menyediakan layanan.

Backend: Adalah logika aplikasi dan data yang disediakan oleh server (terutama application server dan database server) dan tidak terlihat langsung oleh pengguna

## Nginx
# Konteks Global/Main
# Pengaturan umum untuk seluruh Nginx

events {
    # Konteks Events
    # Pengaturan yang berkaitan dengan penanganan koneksi
}

http {
    # Konteks HTTP
    # Pengaturan umum untuk semua server HTTP/HTTPS

    server {
        # Konteks Server Block (Virtual Host)
        # Mendefinisikan satu situs web atau aplikasi

        location / {
            # Konteks Location Block
            # Mendefinisikan bagaimana menangani URL tertentu
        }

        location /api {
            # Konteks Location Block lain
        }
    }

    server {
        # Konteks Server Block lain
    }
}
server { # Mendefinisikan sebuah server block untuk situs web Anda
    listen 80; # Server ini akan mendengarkan di port 80 (HTTP)
    server_name localhost; # Server ini akan merespons permintaan untuk nama host 'localhost'

    root /var/www/html/public; # Direktori utama tempat Nginx akan mencari file. Untuk Laravel, ini adalah folder 'public'.

    # Menambahkan header HTTP keamanan dasar
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index.html index.htm index.php; # Urutan file yang akan dicoba jika permintaan adalah ke direktori

    charset utf-8; # Mengatur karakter set respons

    # Blok lokasi utama untuk semua permintaan
    location / {
        # Ini adalah inti untuk Laravel.
        # Nginx mencoba melayani permintaan sebagai file statis ($uri),
        # jika itu direktori ($uri/),
        # jika keduanya gagal, permintaan diteruskan secara internal ke index.php
        # untuk diproses oleh Laravel (URL aslinya tetap terjaga).
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Lokasi spesifik untuk favicon.ico dan robots.txt (seringkali diabaikan dari log)
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # Mengarahkan semua error 404 ke index.php (Laravel akan menanganinya)
    error_page 404 /index.php;

    # Blok lokasi untuk menangani file PHP
    location ~ \.php$ { # Mencocokkan URL yang diakhiri dengan .php (menggunakan regular expression)
        # Meneruskan permintaan ke PHP-FPM melalui protokol FastCGI.
        # 'php' adalah nama service kontainer PHP-FPM di Docker Compose.
        # ':9000' adalah port di mana PHP-FPM mendengarkan.
        fastcgi_pass php:9000;
        fastcgi_index index.php; # File yang akan dieksekusi jika permintaan ke direktori PHP
        fastcgi_buffers 16 16k; # Mengatur buffer untuk FastCGI
        fastcgi_buffer_size 32k;
        # Mengatur parameter FastCGI yang diperlukan oleh PHP-FPM
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params; # Mengimpor set parameter FastCGI standar Nginx
    }

    # Mencegah akses ke file dotfiles tersembunyi (kecuali .well-known untuk SSL)
    location ~ /\.(?!well-known).* {
        deny all; # Menolak semua permintaan ke file yang diawali dengan titik
    }
}



kalo klik
