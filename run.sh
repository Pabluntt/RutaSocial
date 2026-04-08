#!/bin/bash

# Script para ejecutar RutaSocial con Docker
# Uso simple: ./run.sh

echo "═══════════════════════════════════════"
echo "  🚀 Iniciando RutaSocial con Docker"
echo "═══════════════════════════════════════"

# Verificar si Docker está corriendo
echo -e "\n📋 Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    exit 1
else
    echo "✅ Docker está corriendo"
fi

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "\n🗂️  Proyecto: $SCRIPT_DIR"

# Mostrar opciones
echo -e "\n📌 Selecciona una opción:"
echo "1. Iniciar servicios (detener si están corriendo)"
echo "2. Ver logs en tiempo real"
echo "3. Detener servicios"
echo "4. Eliminar volúmenes y empezar de cero"
echo "5. Ver estado de los contenedores"

read -p "👉 Opción (1-5): " opcion

case $opcion in
    1)
        echo -e "\n⏹️  Deteniendo servicios anteriores..."
        docker-compose down -q

        echo "🚀 Iniciando servicios..."
        docker-compose up -d

        sleep 3
        
        echo -e "\n✨ Servicios iniciados:"
        echo "   📦 Backend:    http://localhost:8080"
        echo "   🌐 Frontend:   http://localhost:3000"
        echo "   📚 Swagger:    http://localhost:8080/swagger/index.html"
        echo "   🗄️  MongoDB:   localhost:27017"
        
        echo -e "\n💡 Para ver logs: ./run.sh y selecciona opción 2"
        ;;
    2)
        echo -e "\n📊 Mostrando logs en tiempo real (Ctrl+C para salir)..."
        docker-compose logs -f --tail=50
        ;;
    3)
        echo -e "\n⏹️  Deteniendo servicios..."
        docker-compose down
        echo "✅ Servicios detenidos"
        ;;
    4)
        echo -e "\n⚠️  ADVERTENCIA: Esto eliminará todos los datos locales!"
        read -p "¿Estás seguro? (s/n): " confirm
        if [ "$confirm" = "s" ]; then
            echo -e "\n🗑️  Eliminando contenedores y volúmenes..."
            docker-compose down -v
            echo "✅ Eliminado. Usa opción 1 para empezar de cero."
        else
            echo "❌ Cancelado"
        fi
        ;;
    5)
        echo -e "\n📊 Estado de los contenedores:"
        docker-compose ps
        ;;
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac

echo ""
