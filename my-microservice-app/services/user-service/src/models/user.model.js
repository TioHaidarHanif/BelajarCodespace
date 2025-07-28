// user-api/src/models/user.model.js
const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: { // Untuk contoh sederhana, tidak di-hash. Di produksi HARUS di-hash!
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users' // Pastikan nama tabel adalah 'users'
});

// Sinkronkan model dengan database (buat tabel jika belum ada)
// Ini hanya untuk pengembangan. Di produksi, gunakan migrasi database.
sequelize.sync().then(() => {
  console.log('Database & tables created!');
}).catch(err => {
  console.error('Error syncing database:', err);
});

module.exports = User;