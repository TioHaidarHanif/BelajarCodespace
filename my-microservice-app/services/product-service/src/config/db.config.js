// services/product-service/src/config/db.config.js
module.exports = {
  HOST: process.env.DB_HOST || "products_db", // Nama service MySQL untuk produk di Docker Compose
  USER: process.env.DB_USER || "product_user",
  PASSWORD: process.env.DB_PASSWORD || "product_password",
  DB: process.env.DB_NAME || "product_db",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};