// user-api/src/app.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/user.routes');
const User = require('./models/user.model'); // Untuk memastikan model disinkronkan saat aplikasi dimulai

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute dasar
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the User Microservice API!" });
});

// Gunakan rute pengguna
app.use('/api/users', userRoutes);

// Set port dan mulai server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`API documentation: http://localhost:${PORT}/api/users`);
});