# Dev image: nodemon + bind-mounted source (see docker-compose.yml)
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts: html-pdf pulls phantomjs-prebuilt, whose postinstall
# downloads a binary that does not exist for linux/arm64 and aborts the install.
# All other deps are pure JS, so skipping scripts is safe. PDF export will not
# work inside the container on Apple Silicon (same limitation as native arm64).
RUN (npm ci --ignore-scripts || npm install --ignore-scripts) && npm cache clean --force

COPY . .

EXPOSE 8888
CMD ["npm", "run", "dev"]
