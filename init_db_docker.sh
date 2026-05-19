#!/bin/sh

# Este script funciona para crear el usuario admin del sistea con todos los permisos en docker
echo "Configurando el entorno de Aqua Gloss Pro en Docker..."

echo "Configurando el entorno de Aqua Gloss Pro..."

run_seed() {
  echo "Ejecutando: $1..."
  node "$2"
  if [ $? -eq 0 ]; then
    echo ">> $1 FINALIZADO EXITOSAMENTE"
  else
    echo "ERROR: $1 falló."
    exit 1
  fi
}

run_seed "Modulos y permisos" "dist/database/SCRIPTS/modules.script.js"
run_seed "Rol de cajero" "dist/database/SCRIPTS/cashier.rol.script.js"
run_seed "Rol de administrador" "dist/database/SCRIPTS/admin.rol.script.js"
run_seed "Rol de supervisor de pista" "dist/database/SCRIPTS/track_viewer.rol.script.js"
run_seed "Rol de cliente" "dist/database/SCRIPTS/client.rol.script.js"

echo "Todos los seeds aplicados. Arrancando Aqua Gloss Pro..."
exec node dist/main.js