FROM node:latest

WORKDIR /app/shopping

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8083

CMD ["npm", "start"]