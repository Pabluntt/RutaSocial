# Script para ejecutar RutaSocial con Docker
# Uso simple: .\run.ps1

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 Iniciando RutaSocial con Docker" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# Verificar si Docker está corriendo
Write-Host "`n📋 Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker no está corriendo. Iniciando Docker Desktop..." -ForegroundColor Red
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Start-Sleep -Seconds 30
    } else {
        Write-Host "✅ Docker está corriendo" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error al verificar Docker: $_" -ForegroundColor Red
    exit 1
}

# Verificar si docker-compose está disponible
Write-Host "`n📋 Verificando docker-compose..." -ForegroundColor Yellow
try {
    docker-compose --version > $null 2>&1
    Write-Host "✅ docker-compose está disponible" -ForegroundColor Green
} catch {
    Write-Host "❌ docker-compose no está instalado" -ForegroundColor Red
    exit 1
}

# Ir al directorio del proyecto
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "`n🗂️  Proyecto: $projectPath" -ForegroundColor Yellow

# Mostrar opciones
Write-Host "`n📌 Selecciona una opción:" -ForegroundColor Cyan
Write-Host "1. Iniciar servicios (detener si están corriendo)" -ForegroundColor Gray
Write-Host "2. Ver logs en tiempo real" -ForegroundColor Gray
Write-Host "3. Detener servicios" -ForegroundColor Gray
Write-Host "4. Eliminar volúmenes y empezar de cero" -ForegroundColor Gray
Write-Host "5. Ver estado de los contenedores" -ForegroundColor Gray

$opcion = Read-Host "`n👉 Opción (1-5)"

switch ($opcion) {
    "1" {
        Write-Host "`n⏹️  Deteniendo servicios anteriores..." -ForegroundColor Yellow
        docker-compose down -q

        Write-Host "🚀 Iniciando servicios..." -ForegroundColor Green
        docker-compose up -d

        Start-Sleep -Seconds 3
        
        Write-Host "`n✨ Servicios iniciados:" -ForegroundColor Green
        Write-Host "   📦 Backend:    http://localhost:8080" -ForegroundColor Cyan
        Write-Host "   🌐 Frontend:   http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   📚 Swagger:    http://localhost:8080/swagger/index.html" -ForegroundColor Cyan
        Write-Host "   🗄️  MongoDB:   localhost:27017" -ForegroundColor Cyan
        
        Write-Host "`n💡 Para ver logs: .\run.ps1 y selecciona opción 2" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "`n📊 Mostrando logs en tiempo real (Ctrl+C para salir)..." -ForegroundColor Yellow
        docker-compose logs -f --tail=50
    }
    "3" {
        Write-Host "`n⏹️  Deteniendo servicios..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    }
    "4" {
        Write-Host "`n⚠️  ADVERTENCIA: Esto eliminará todos los datos locales!" -ForegroundColor Red
        $confirm = Read-Host "¿Estás seguro? (s/n)"
        if ($confirm -eq "s") {
            Write-Host "`n🗑️  Eliminando contenedores y volúmenes..." -ForegroundColor Yellow
            docker-compose down -v
            Write-Host "✅ Eliminado. Usa opción 1 para empezar de cero." -ForegroundColor Green
        } else {
            Write-Host "❌ Cancelado" -ForegroundColor Yellow
        }
    }
    "5" {
        Write-Host "`n📊 Estado de los contenedores:" -ForegroundColor Green
        docker-compose ps
    }
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
    }
}

Write-Host ""
