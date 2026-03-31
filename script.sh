#!/bin/bash

echo "Configurando el entorno de Sistema de Ventas..."

# 1. Ejecutar el seeding de la base de datos
echo "Poblando base de datos (Módulos y Roles)..."
node dist/database/SCRIPTS/seed.scripts.js

# 2. Verificar si el comando anterior fue exitoso
if [ $? -eq 0 ]; then
    echo "-------- SEEDING FINALIZADO --------"
    echo "La base de datos se ha poblado correctamente. El servidor se iniciará en breve."

    sleep 5
    exec npm run start:prod
else
    echo "ERROR: El seeding falló. El servidor no se iniciará para evitar inconsistencias."
    exit 1
fi