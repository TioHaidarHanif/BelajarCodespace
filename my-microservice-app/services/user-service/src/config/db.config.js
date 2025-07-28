// user-api/src/config/db.config.js
module.exports = {
  HOST: process.env.DB_HOST || "mysql_db", // Nama service MySQL di Docker Compose
  USER: process.env.DB_USER || "user",
  PASSWORD: process.env.DB_PASSWORD || "password",
  DB: process.env.DB_NAME || "user_db",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};