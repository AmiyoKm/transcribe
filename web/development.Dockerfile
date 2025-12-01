FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN npm install --ci
RUN npm install next typescript

COPY . .

RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

EXPOSE 3000

CMD ["npm", "run", "dev"]
