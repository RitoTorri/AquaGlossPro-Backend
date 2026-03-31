FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

# 1. Instalamos dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# 2. Copiamos el código compilado
COPY --from=builder /app/dist ./dist

# 3. COPIAR EL SCRIPT ANTES DE CAMBIAR DE USUARIO
COPY ./script.sh /app/script.sh

# 4. DAR PERMISOS (Como root, que es el default aquí)
RUN chmod +x /app/script.sh

# 5. CAMBIAR EL DUEÑO DE LOS ARCHIVOS AL USUARIO NODE
# Esto es vital porque si no, el usuario 'node' no podrá ejecutar nada en /app
RUN chown node:node /app/script.sh

# 6. AHORA SÍ, PASAMOS AL USUARIO SIN PRIVILEGIOS
USER node

EXPOSE 3000

# Usamos el script como el comando principal
CMD ["/bin/sh", "/app/script.sh"]