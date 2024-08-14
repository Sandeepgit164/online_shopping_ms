FROM node:latest

WORKDIR /app/products

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8082

CMD ["npm", "start"]