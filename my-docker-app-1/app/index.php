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
