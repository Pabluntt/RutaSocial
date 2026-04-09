# Frontend/Dockerfile
FROM node:23.8-alpine
WORKDIR /app

ENV VITE_URL_BACKEND=https://rutasocial-production.up.railway.app

COPY package*.json ./
RUN npm ci

COPY . .

# Build
RUN npm run build

# Verify dist exists and has content
RUN ls -la dist/ && test -f dist/index.html || (echo "ERROR: dist/index.html not found!" && exit 1)

# Use node server instead of nginx
RUN npm install -g serve
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]