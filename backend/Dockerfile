FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apt-get update && apt-get install -y postgresql-client

COPY . .

EXPOSE 8000
CMD ["node", "server.js"]
