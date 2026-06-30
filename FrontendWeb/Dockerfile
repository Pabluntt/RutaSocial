# Frontend/Dockerfile
FROM node:23.8-alpine AS build
WORKDIR /app

ARG APP_ENV=production
ARG VITE_URL_BACKEND=https://web-production-15640.up.railway.app
ARG VITE_BASE_URL=
ENV APP_ENV=$APP_ENV
ENV VITE_URL_BACKEND=$VITE_URL_BACKEND
ENV VITE_BASE_URL=$VITE_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .

RUN if [ "$APP_ENV" = "production" ]; then \
      case "$VITE_URL_BACKEND" in \
        ""|http://localhost*|http://127.0.0.1*|http://0.0.0.0*|http://*) \
          echo "ERROR: VITE_URL_BACKEND must be a production HTTPS URL" && exit 1 ;; \
      esac; \
    fi

# Build
RUN npm run build

# Verify dist exists and has content
RUN ls -la dist/ && test -f dist/index.html || (echo "ERROR: dist/index.html not found!" && exit 1)

FROM nginx:1.27-alpine
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
