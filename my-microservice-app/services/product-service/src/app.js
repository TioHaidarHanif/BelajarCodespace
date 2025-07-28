// services/product-service/src/app.js
const express = require('express');
const app = express();
const productRoutes = require('./routes/product.routes');
const Product = require('./models/product.model'); // Untuk memastikan model disinkronkan

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute dasar
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Product Microservice API!" });
});

// Gunakan rute produk
app.use('/api/products', productRoutes);

// Set port dan mulai server
const PORT = process.env.PORT || 3001; // Port default 3001
app.listen(PORT, () => {
  console.log(`Product Server is running on port ${PORT}.`);
  console.log(`API documentation: http://localhost:${PORT}/api/products`);
});