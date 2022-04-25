# Build
FROM node:16-alpine3.15 as builder

WORKDIR /app

# Build tools
RUN apk add --no-cache \
    build-base \
    gcc \
    g++ \
    make

# Install dependencies
COPY package*.json ./
RUN npm install

# Build dist
COPY . .
RUN npm run build

# Relese
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/

EXPOSE 80
