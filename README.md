# 🚀 RutaSocial - Plataforma de Rutas Sociales

Proyecto fullstack con **Backend (Go), Frontend Web (React), Frontend Móvil (React Native)** y **MongoDB Atlas**.

---

## 📦 Stack Tecnológico

### Backend
- **Lenguaje:** Go 1.24.0
- **Framework:** Gin
- **Base de Datos:** MongoDB Atlas (Nube)
- **Autenticación:** JWT
- **Documentación API:** Swagger

### Frontend Web
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **UI:** Material-UI (MUI) + Tailwind CSS
- **Mapas:** Leaflet
- **Gestión de datos:** React Query

### Frontend Móvil
- **Framework:** React Native + Expo
- **Plataformas:** iOS, Android, Web
- **Navegación:** React Navigation

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
| **MongoDB** | localhost:27017 | Base de datos |

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
npm install
npm run dev
```

### Frontend Móvil
```bash
cd FrontendMovil/frontmovil
npm install
npm start
```

---

## 📝 Variables de Entorno

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=app
JWT_SECRET=tu_clave_secreta
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
├── Backend/              # API Go + Gin
│   ├── cmd/             # Punto de entrada
│   ├── internal/        # Lógica de negocio
│   ├── docs/            # Swagger
│   └── Dockerfile
├── FrontendWeb/         # React + Vite
│   ├── src/
│   └── Dockerfile
├── FrontendMovil/       # React Native + Expo
│   └── frontmovil/
├── docker-compose.yml   # Orquestación de servicios
└── run.ps1 / run.sh     # Scripts de inicio
```

---

## 🔗 Conexión a MongoDB Atlas

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

### Puerto ocupado
- Si el puerto 5174 está ocupado, Vite usa el siguiente disponible
- Busca la URL en los logs

---

## 📞 Soporte

Para dudas o problemas:
1. Revisa los logs: `docker-compose logs [servicio]`
2. Verifica las variables de entorno
3. Reinicia los servicios: `docker-compose restart`

---

**Hecho con ❤️ - RutaSocial 2026**
