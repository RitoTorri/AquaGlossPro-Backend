#!/bin/bash

echo "Configurando el entorno local de Aqua Gloss Pro..."

# 1. Carga de variables (Versión robusta para evitar errores de identificador)
if [ -f .env ]; then
  set -a           
  source .env       
  set +a           
fi

# Configurar contraseña para psql (evita que pida pass en cada archivo)
export PGPASSWORD=$POSTGRES_PASSWORD
echo "Conectando a: $POSTGRES_HOST:$POSTGRES_PORT como $POSTGRES_USER"

# 2. Crear la BD (nos conectamos a 'postgres' para poder crear la de ventas)
echo "Asegurando existencia de la base de datos: $POSTGRES_DB..."
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 || \
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $POSTGRES_DB;"

# 3. Aplicar los archivos SQL
echo "Aplicando archivos SQL en orden..."
for file in ./src/database/SQL/*.sql; do
  if [ -f "$file" ]; then
    echo ">> Ejecutando: $file "
    psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -f "$file"
  fi
done

run_seed() {
  echo "Ejecutando: $1..."
  npx ts-node "$2"
  if [ $? -eq 0 ]; then
    echo ">> $1 FINALIZADO EXITOSAMENTE"
  else
    echo "ERROR: $1 falló."
    exit 1
  fi
}

run_seed "Modulos y permisos" "src/database/SCRIPTS/modules.script.ts"
run_seed "Rol de cajero" "src/database/SCRIPTS/cashier.rol.script.ts"
run_seed "Rol de administrador" "src/database/SCRIPTS/admin.rol.script.ts"
run_seed "Rol de supervisor de pista" "src/database/SCRIPTS/track_viewer.rol.script.ts"
run_seed "Rol de cliente" "src/database/SCRIPTS/client.rol.script.ts"