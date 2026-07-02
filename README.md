# 🚀 RutaSocial - Plataforma de Rutas Sociales

Proyecto fullstack con **Backend (Go), Frontend Web (React), Frontend Móvil (React Native + Expo)** y **MongoDB**. En desarrollo con Docker se usa MongoDB local; en despliegues se puede usar MongoDB Atlas mediante variables de entorno.

---

## 📦 Stack Tecnológico

### Backend
- **Lenguaje:** Go 1.24.0
- **Framework:** Gin
- **Base de Datos:** MongoDB local con Docker o MongoDB Atlas en despliegue
- **Autenticación:** JWT
- **Documentación API:** Swagger

### Frontend Web
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **UI:** Material-UI (MUI) + Tailwind CSS
- **Mapas:** Leaflet + heatmaps
- **Calendario:** FullCalendar
- **Gestión de datos:** React Query
- **Estado local:** Zustand
- **Testing:** Vitest + Testing Library + Playwright

### Frontend Móvil
- **Framework:** React Native + Expo 54
- **Plataformas:** iOS, Android, Web
- **Navegación:** React Navigation
- **Mapas:** React Native Maps
- **Persistencia local:** AsyncStorage
- **Testing:** Jest Expo + Testing Library React Native

### DevOps
- **CI:** GitHub Actions
- **Contenedores:** Docker + Docker Compose
- **Servidor Frontend Web:** Nginx

---

## ⚡ Inicio Rápido (Recomendado)

### En Windows
```powershell
# Ejecuta el script interactivo
.\run.ps1
# Selecciona opción 1 para iniciar
```

### En Linux/Mac
```bash
# Dale permisos de ejecución
chmod +x run.sh

# Ejecuta el script interactivo
./run.sh
# Selecciona opción 1 para iniciar
```

---

## 🐳 Comandos Docker Manuales

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Ver logs en tiempo real
```bash
docker-compose logs -f backend
```

### Detener servicios
```bash
docker-compose down
```

### Eliminar volúmenes (datos locales)
```bash
docker-compose down -v
```

---

## 🌐 Acceso a los Servicios

Una vez iniciados, accede a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend Web** | http://localhost:3000 | Aplicación web principal |
| **Backend API** | http://localhost:8080 | API REST |
| **Swagger UI** | http://localhost:8080/swagger/index.html | Documentación interactiva |
| **MongoDB** | localhost:27017 | Base de datos local usada por Docker |

> El contenedor del Frontend Web escucha internamente en el puerto `8080`, pero Docker lo publica en `http://localhost:3000`.

---

## 🛠️ Desarrollo Local (sin Docker)

### Backend
```bash
cd Backend
go mod download
go run cmd/main.go
```
Requiere archivo `.env` configurado.

### Frontend Web
```bash
cd FrontendWeb
npm ci
npm run dev
```

### Frontend Móvil
```bash
cd FrontendMovil
npm ci
npm start
```

---

## ✅ Testing y CI

### Backend
```bash
cd Backend
go vet ./...
go test ./... -v
```

### Frontend Web
```bash
cd FrontendWeb
npm run typecheck
npm test
npm run build
npm run test:e2e
```

### Frontend Móvil
```bash
cd FrontendMovil
npm run typecheck
npm test
```

### CI/CD

El proyecto incluye GitHub Actions en `.github/workflows/ci.yml` con:

- Backend: `go vet` y `go test`
- Frontend Web: instalación, lint, typecheck, tests y build
- Frontend Móvil: typecheck y tests
- Docker Compose build
- E2E local con Playwright/API smoke

---

## 📝 Variables de Entorno

> No subas archivos `.env` reales al repositorio. Usa los archivos `.env.example` como plantilla y configura secretos en el proveedor de despliegue.

### Crear archivos locales desde ejemplos

#### Windows
```powershell
Copy-Item Backend\.env.example Backend\.env
Copy-Item FrontendWeb\.env.example FrontendWeb\.env
Copy-Item FrontendMovil\.env.example FrontendMovil\.env
```

#### Linux/Mac
```bash
cp Backend/.env.example Backend/.env
cp FrontendWeb/.env.example FrontendWeb/.env
cp FrontendMovil/.env.example FrontendMovil/.env
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=app
MONGO_INITDB_ROOT_USERNAME=user
MONGO_INITDB_ROOT_PASSWORD=pass
MONGODB_DB_NAME=pip
JWT_SECRET=tu_clave_secreta
APP_ENV=development
PORT=8080
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin12345
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_MOBILE=http://localhost:8081
EMAIL_FROM=noreply@example.com
EMAIL_PASS=tu_contraseña
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Frontend Web (.env)
```env
VITE_URL_BACKEND=http://localhost:8080
VITE_BASE_URL=
```

### Frontend Móvil (.env)
```env
EXPO_PUBLIC_URL_BACKEND=http://192.168.x.x:8080
GOOGLE_MAPS_API_KEY=tu_api_key
```

---

## 🗂️ Estructura del Proyecto

```
RutaSocial/
├── .github/              # Workflows de CI
├── Backend/              # API Go + Gin
│   ├── cmd/             # Punto de entrada
│   ├── internal/        # Dominio, casos de uso, repositorios, middleware, DTOs
│   ├── docs/            # Swagger
│   └── Dockerfile
├── FrontendWeb/         # React + Vite
│   ├── src/
│   ├── nginx.conf
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   └── Dockerfile
├── FrontendMovil/       # React Native + Expo
│   ├── src/
│   ├── package.json
│   └── app.config.js
├── scripts/             # Smoke tests y E2E local
├── docker-compose.yml   # Orquestación de servicios
└── run.ps1 / run.sh     # Scripts de inicio
```

---

## 🔗 Conexión a MongoDB Atlas

Con Docker Compose se levanta MongoDB local automáticamente. Para usar MongoDB Atlas en desarrollo local o producción:

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster
3. Obtén la URI de conexión
4. Actualiza `Backend/.env` con `MONGODB_URI`
5. Reinicia el backend: `docker-compose restart backend`

---

## 📱 Desplegar en la Nube

### Backend en Render.com (Gratis)
```bash
# 1. Crea cuenta en https://render.com
# 2. Conecta tu repositorio GitHub
# 3. Configura variables de entorno
# 4. Deploy automático
```

### Backend en Railway (pequeño crédito gratis)
```bash
# 1. Instala Railway CLI
npm install -g railway

# 2. Conecta tu proyecto
railway login
railway link

# 3. Deploy
railway up
```

---

## 🐛 Troubleshooting

### CORS bloqueado
- Verifica que `FRONTEND_URL` esté correctamente configurado en `Backend/.env`
- Reinicia el backend: `docker-compose restart backend`

### MongoDB no conecta
- Verifica la URI en `Backend/.env`
- Asegúrate de que tu IP esté whitelisteada en MongoDB Atlas
- Si usas Docker local, verifica que el servicio `mongo` esté saludable con `docker-compose ps`

### Puerto ocupado
- Si el puerto 5173 está ocupado, Vite usa el siguiente disponible
- Busca la URL en los logs

### Tests fallan en Frontend Web
- Ejecuta `npm ci` dentro de `FrontendWeb`
- Verifica que `npm run typecheck` pase antes de `npm test`

### Tests fallan en Frontend Móvil
- Ejecuta `npm ci` dentro de `FrontendMovil`
- Verifica que Expo y Jest usen las versiones del `package-lock.json`

---

## 📞 Soporte

Para dudas o problemas:
1. Revisa los logs: `docker-compose logs [servicio]`
2. Verifica las variables de entorno
3. Reinicia los servicios: `docker-compose restart`

---

**Hecho con ❤️ - RutaSocial 2026**
