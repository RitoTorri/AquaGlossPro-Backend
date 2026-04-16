FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dos2unix bash
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY ./init_db_docker.sh /app/init_db_docker.sh

# Limpiamos los finales de línea de Windows y damos permisos
RUN dos2unix /app/init_db_docker.sh && chmod +x /app/init_db_docker.sh

RUN chown node:node /app/init_db_docker.sh

USER node

EXPOSE 3000

# Ejecutamos con bash explícitamente ya que lo instalamos arriba
CMD ["/bin/bash", "/app/init_db_docker.sh"]