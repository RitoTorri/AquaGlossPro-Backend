# 🧼 AquaGloss Pro - API REST

Esta es la API centralizada para la gestión integral de autolavados. El sistema no solo gestiona la operatividad del lavado, sino que integra de forma automatizada el control de inventario (químicos), liquidación de comisiones y una suite contable para la toma de decisiones financieras.

### 📑 Índice

- [Stack tecnológico](#️-stack-tecnológico)
- [Instalación](#-instalación)
- [Configuración inicial](#-configuración-inicial)
- [Guía de inicio rápido](#-guía-de-inicio-rápido)
- [Documentación](#-documentación)

<br>

# 🛠️ Stack tecnológico

<div align="center">

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-000000?style=for-the-badge&logo=typeorm&logoColor=white)

</div>

### ⌨️ Codigo de la Base de datos

Puedes ver el codigo de la base de datos [📍Aqui](https://github.com/RitoTorri/Backend-Gestion-Autolavados/blob/master/database/DB.sql)

<br>

# 📦 Instalación:

```bash
# Clona el repositorio
git clone https://github.com/RitoTorri/Backend-Gestion-Autolavados

# Entra al directorio
cd Backend-Gestion-Autolavados

# Instala las dependencias
npm install
```

<br>

# 🔧 Configuración inicial

### 🔐 Variables de entorno (.env):

Debes renombrar `.env.example` a `.env` y configurar:

| Variable                | Descripción                                         | Ejemplo                 |
| ----------------------- | --------------------------------------------------- | ----------------------- |
| `PORT`                  | Puerto de la aplicación                             | `3000`                  |
| `API_RATE_LIMIT_MAX`    | Cantidad máxima de peticiones por ventana de tiempo | `100`                   |
| `API_RATE_LIMIT_WINDOW` | Ventana de tiempo para rate limiting (ms)           | `900000`                |
| `TOKEN_ACCESS`          | Llave secreta para tokens JWT                       | `tu_clave_secreta`      |
| `POSTGRES_HOST`         | Host de la base de datos                            | `localhost`             |
| `POSTGRES_PORT`         | Puerto de PostgreSQL                                | `5432`                  |
| `POSTGRES_USER`         | Usuario de la base de datos                         | `postgres`              |
| `POSTGRES_PASSWORD`     | Contraseña de la base de datos                      | `postgres123`           |
| `POSTGRES_DB`           | Nombre de la base de datos                          | `sistema_ventas`        |
| `FRONTEND_URL`          | URL del frontend para CORS                          | `http://localhost:3543` |

<br>

# 🚀 Guía de inicio rápido

Este proyecto incluye un script de inicialización (`script.sh`) que configura la base de datos y arranca el servidor.  
**Su comportamiento varía según el entorno:**

- En **modo desarrollo**, solo debe ejecutarse **una vez** para preparar la base de datos.
- En **modo producción** (Docker), el script se ejecuta automáticamente al levantar los contenedores.

### 🐳 Docker (producción)

Sigue estos pasos para levantar el proyecto con Docker:

```bash
# Construir la imagen
docker compose build

# Levantar los contenedores
docker compose up
```

> El script `script.sh` se ejecuta automáticamente dentro del contenedor y deja el servidor listo en modo producción.

### 💻 Entorno local (desarrollo)

#### 🔁 Primera vez

Si es la primera vez que ejecutas el proyecto:

```bash
# Compilar el proyecto
npm run build

# Ejecutar el script de inicialización
./script.sh
```

> ⚠️ Este script inicia el servidor en **modo producción**.  
> Una vez que haya hecho su trabajo (configurar la base de datos y arrancar), puedes detenerlo con `Ctrl + C` y continuar con el modo desarrollo.

#### 🔁 Ejecuciones posteriores

Después de haber ejecutado el script al menos una vez:

```bash
# Iniciar el servidor con hot-reload
npm run start:dev
```

### 📌 Resumen

| Entorno       | Comandos                                                                                |
| ------------- | --------------------------------------------------------------------------------------- |
| 🐳 Producción | `docker compose build` → `docker compose up`                                            |
| 💻 Desarrollo | **Primera vez:** `npm run build` → `./script.sh`<br>**Siguientes:** `npm run start:dev` |

<br>

# 📄 Documentación

Para ver la documentación de la API REST, visite la siguiente URL:

```bash
http://localhost:PUERTO/docs
```
