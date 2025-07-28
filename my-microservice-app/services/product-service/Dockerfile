# services/product-service/Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install

# Add wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

COPY . .

EXPOSE 3001
CMD ["/wait-for-it.sh", "products_db:3306", "--", "npm", "start"]