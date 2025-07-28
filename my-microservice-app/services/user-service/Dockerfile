# user-api/Dockerfile
# Gunakan base image Node.js LTS (Long Term Support)
FROM node:20-alpine

# Set working directory di dalam kontainer
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json (jika ada)
# Ini dilakukan terpisah untuk memanfaatkan caching layer Docker
COPY package*.json ./

# Instal dependensi Node.js
RUN npm install

# Salin seluruh kode aplikasi dari host ke kontainer
COPY . .

# Expose port yang digunakan aplikasi Express.js
EXPOSE 3000

# Perintah untuk menjalankan aplikasi ketika kontainer dimulai
CMD ["npm", "start"]