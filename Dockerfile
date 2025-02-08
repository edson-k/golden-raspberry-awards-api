FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    sqlite3 libsqlite3-dev python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
