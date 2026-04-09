# Frontend/Dockerfile
FROM node:23.8-alpine AS build
WORKDIR /app
ENV VITE_URL_BACKEND=${VITE_URL_BACKEND:-https://backend-production.up.railway.app}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost/index.html || exit 1
CMD ["nginx", "-g", "daemon off;"]