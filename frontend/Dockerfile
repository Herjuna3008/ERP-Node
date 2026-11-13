# Dev image: Vite dev server + bind-mounted source (see docker-compose.yml)
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN (npm ci || npm install) && npm cache clean --force

COPY . .

EXPOSE 3000
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]
