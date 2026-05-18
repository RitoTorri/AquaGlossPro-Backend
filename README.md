# 🧼 AquaGloss Pro - API REST

Esta es la API centralizada para la gestión integral de autolavados. El sistema no solo gestiona la operatividad del lavado, sino que integra de forma automatizada el control de inventario (químicos), liquidación de comisiones y una suite contable para la toma de decisiones financieras.

### 📑 Índice

- [Stack tecnológico](#️-stack-tecnológico)
- [Base de datos de AquaGloss Pro](#-base-de-datos-de-aquagloss-pro)    
- [Instalación](#-instalación)
- [Configuración inicial](#-configuración-inicial)
- [Guía de inicio rápido](#-guía-de-inicio-rápido)
- [Usuario Administrador](#-usuario-administrador)
- [Documentación](#-documentación)

<br>

# 🛠️ Stack tecnológico

<div align="center">


<p align="center">
  <img src="https://skillicons.dev/icons?i=typescript,nestjs,postgresql,docker,git,jest,bash" height="50" />
</p>

</div>

# ⚙️ Base de datos de AquaGloss Pro

### ⌨️ Codigo de la Base de datos

Puedes ver el codigo de la base de datos [📍Aqui](https://github.com/RitoTorri/AquaGlossPro-Backend/tree/master/src/database/SQL)

### 🔑 Composición de los TOKENS (JWT)

Este sistema utiliza JWT para autenticar y autorizar las peticiones. Cada petición recibe un token JWT que contiene información sobre el usuario y su permisos. El token se genera automáticamente al inicar sesión.

**Composición del TOKEN ACCESS:**

```json
{
  "userID":"1",
  "roleId":"1",
  "iat": 1516239022,
  "exp": 1516242622,
  "TOKEN_ACCESS":clave_secreta
}
```

<br>

# 📦 Instalación:

```bash
# Clona el repositorio
git clone https://github.com/RitoTorri/AquaGlossPro-Backend

# Entra al directorio
cd AquaGlossPro-Backend
```

<br>

# 🔧 Configuración inicial

### 🔐 Variables de entorno (.env):

Debes renombrar `.env.example` a `.env` y configurar:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto de la aplicación | `3000` |
| `API_RATE_LIMIT_MAX` | Cantidad máxima de peticiones por ventana de tiempo | `100` |
| `API_RATE_LIMIT_WINDOW` | Ventana de tiempo para rate limiting (ms) | `900000` |
| `TOKEN_ACCESS` | Llave secreta para tokens JWT | `tu_clave_secreta` |
| `POSTGRES_HOST` | Host de la base de datos | `localhost` |
| `POSTGRES_PORT` | Puerto de PostgreSQL | `5432` |
| `POSTGRES_USER` | Usuario de la base de datos | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña de la base de datos | `postgres123` |
| `POSTGRES_DB` | Nombre de la base de datos | `Aqua Gloss Pro` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:3543` |

<br>

# 🚀 Guía de inicio rápido

Este proyecto incluye scripts de inicialización que configura la base de datos y arranca el servidor.  
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

### 💻 Entorno local (desarrollo)

**Es recomendado que se ejecute solo una vez**. Para configurar el proyecto de manera local, ejecuta los siguientes comandos:

```bash
# Entra al directorio
cd AquaGlossPro-Backend

# instala las dependencias
npm install

# Ejecutar el seeding de la base de datos
./init_db_local.sh

# Ejecutar el servidor con hot-reload
npm run start:dev
```

### 📌 Explicación de los scripts

- `init_db_local.sh`: Este escript se encarga de crear la base de datos en caso de que no exista y ejecuta los archivos SQL de la ruta `/src/database/SQL` para crear los enums, tablas, views y functions necesarios para que el codigo funcione. Además, ejecuta el seeding de la base de datos para crear los roles, permisos y el usuario administrador.
- `init_db_docker.sh`: Ejecuta el seeding de la base de datos para crear los roles, permisos y el usuario administrador.

<br>

# 👨‍💼 Usuario Administrador

El usuario administrador se crea en los scripts de inicialización, Las credenciales del usuario administrador son:

| Usuario | Contraseña |
|---------|------------|
| admin@admin.com   | admin      |

<br>

# 📄 Documentación

Para ver la documentación de la API REST, visite la siguiente URL:

```bash
http://localhost:PUERTO/docs
```