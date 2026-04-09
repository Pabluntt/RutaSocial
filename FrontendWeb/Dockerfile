# Frontend/Dockerfile
FROM node:23.8-alpine AS build
WORKDIR /app
ENV VITE_URL_BACKEND=https://rutasocial-production.up.railway.app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy custom nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]