# app1/Dockerfile e app2/Dockerfile
FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3060

CMD ["node", "index.js"]
