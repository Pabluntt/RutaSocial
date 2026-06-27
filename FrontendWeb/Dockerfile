# Frontend/Dockerfile
FROM node:23.8-alpine AS build
WORKDIR /app

ENV VITE_URL_BACKEND=http://localhost:8080

COPY package*.json ./
RUN npm ci

COPY . .

# Build
RUN npm run build

# Verify dist exists and has content
RUN ls -la dist/ && test -f dist/index.html || (echo "ERROR: dist/index.html not found!" && exit 1)

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
