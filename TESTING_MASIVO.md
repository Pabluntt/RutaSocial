# Testing Masivo

Esta suite combina pruebas estáticas, unitarias, HTTP real y navegador real.

## Variables requeridas para pruebas reales autenticadas

- `E2E_API_URL`: URL del backend vivo, por ejemplo `http://localhost:8080`.
- `E2E_EMAIL`: usuario válido para login.
- `E2E_PASSWORD`: contraseña del usuario.
- `E2E_BASE_PATH`: opcional, base path web si no es vacío.

## Ejecutar todo

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-massive.ps1
```

## Ejecutar E2E local real aislado

Este comando levanta Mongo en Docker, arranca el backend con un admin de prueba, ejecuta smoke API real y Playwright con login real.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-e2e-local.ps1
```

Si no quieres depender de Open-Meteo durante el smoke:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-e2e-local.ps1 -SkipWeather
```

## Ejecutar sin E2E o sin smoke API

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-massive.ps1 -SkipE2E -SkipApiSmoke
```

## Capas incluidas

- Backend: `go vet`, `go test`, race detector y coverage.
- Frontend web: TypeScript, Vitest y build prod.
- Frontend móvil: TypeScript.
- API smoke: requests HTTP reales contra endpoints críticos.
- Playwright: login y navegación real en Chromium desktop/mobile.

## Límites

La suite detecta regresiones reales, pero no garantiza ausencia total de bugs. La cobertura depende de los flujos escritos y de que el entorno de prueba tenga datos/credenciales representativos.
