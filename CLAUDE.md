# DocFlow — Claude Instructions

## Workflow (MANDATORY after every task)

1. Run tests
2. If pass → `git add`, `git commit`, `git push origin dev`
3. If fail → fix, repeat until pass, then push

## Test commands

```bash
# Backend (Laravel)
cd backend && php artisan test

# Frontend (Vite/React)
cd frontend && npm run build   # no test suite yet; build must pass
```

## Stack

- **Backend**: Laravel 12, PHP 8.3, MySQL 8, Redis, MinIO
- **Frontend**: React 19, Vite 8, Tailwind CSS v4
- **Auth**: Laravel Sanctum (Bearer token)
- **Queues**: Laravel Horizon + Redis
- **Multi-tenancy**: column-based `tenant_id` on all tenant-scoped tables
- **Docker**: all services in `docflow` network

## Key paths

- Backend: `backend/`
- Frontend: `frontend/src/`
- Enums: `backend/app/Enums/`
- Models: `backend/app/Models/`
- Services: `backend/app/Services/`
- Migrations: `backend/database/migrations/`
- API routes: `backend/routes/api.php`
- Pages: `frontend/src/pages/`
- API calls: `frontend/src/api/`

## Git

- Active branch: `dev`
- Remote: `git@github.com:izanrubio/DocFlow.git`
- Commit style: conventional commits (`feat:`, `fix:`, `test:`, `chore:`)
- Always push to `dev` after successful tests

## API response format

```json
{ "data": { ... }, "message": "string", "status": 200 }
```
Use `ApiResponse` trait (`app/Traits/ApiResponse.php`) in all controllers.

## Rules

- No push if tests fail
- No skip tests
- Fix root cause, not symptoms
- No comments unless WHY is non-obvious
- No logic in controllers — use Services
- tenant_id must be present on all tenant-scoped queries
