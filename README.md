# DocFlow

SaaS de firma electrónica y gestión de contratos para el mercado español (autónomos y pymes).

## Stack

- **Backend**: Laravel 12 + MySQL 8 + Redis + MinIO (S3-compatible)
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Colas**: Laravel Horizon + Redis
- **Auth**: Laravel Sanctum
- **Multi-tenancy**: column-based con `tenant_id`
- **Infraestructura**: Docker Compose

## Requisitos previos

- Docker + Docker Compose
- Node.js 20+
- Git

## Levantar el proyecto

### 1. Clona el repositorio

```bash
git clone git@github.com:izanrubio/DocFlow.git
cd DocFlow
```

### 2. Levanta los contenedores

```bash
make up
```

Espera ~30s a que MySQL arranque correctamente.

### 3. Instala dependencias y migra

```bash
make install
make migrate
```

### 4. Levanta el frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno

Las variables están en `backend/.env`. Las principales:

| Variable | Valor | Descripción |
|---|---|---|
| `DB_HOST` | mysql | Host MySQL |
| `DB_DATABASE` | docflow | Base de datos |
| `DB_USERNAME` | docflow | Usuario |
| `DB_PASSWORD` | secret | Contraseña |
| `REDIS_HOST` | redis | Host Redis |
| `MINIO_ENDPOINT` | http://minio:9000 | Endpoint MinIO |
| `AWS_ACCESS_KEY_ID` | docflow | Usuario MinIO |
| `AWS_SECRET_ACCESS_KEY` | secret123 | Contraseña MinIO |
| `MAIL_HOST` | mailpit | SMTP desarrollo |

## Comandos Makefile

| Comando | Descripción |
|---|---|
| `make up` | Levanta todos los contenedores |
| `make down` | Para todos los contenedores |
| `make build` | Reconstruye las imágenes Docker |
| `make bash` | Shell en php-fpm |
| `make migrate` | Ejecuta migraciones |
| `make fresh` | Migraciones + seeds desde cero |
| `make logs` | Logs en tiempo real |
| `make install` | Composer install + key + storage:link |
| `make horizon-logs` | Logs de Horizon |
| `make tinker` | Laravel Tinker |

## URLs de servicios

| Servicio | URL |
|---|---|
| Backend API | http://localhost:8000/api |
| Frontend | http://localhost:5173 |
| MinIO Console | http://localhost:9001 |
| Mailpit UI | http://localhost:8025 |
| Horizon | http://localhost:8000/horizon |

## Credenciales MinIO

- **Usuario**: docflow  **Contraseña**: secret123  **Bucket**: docflow-documents

## API Endpoints — Sprint 1

```
POST  /api/auth/register   Crea tenant + user, devuelve token
POST  /api/auth/login      Devuelve token
GET   /api/auth/me         Usuario autenticado (Bearer token)
POST  /api/auth/logout     Invalida token actual
```

### Respuesta estándar

```json
{ "data": { ... }, "message": "OK", "status": 200 }
```
