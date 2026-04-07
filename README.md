# WiseSystems TO-DO App

Full-stack TO-DO management application.

- Backend: Node.js + Express + Prisma + PostgreSQL
- Frontend: React + TypeScript + Vite + MUI + Redux Toolkit

## Project Structure

- `backend` - API, auth, and todo CRUD
- `frontend` - React client app
- `docker-compose.yml` - local container stack

## Prerequisites

- Docker + Docker Compose (for containerized run, better)

## Run With Docker

From project root:

```bash
docker compose up -d
```

To stop:

```bash
docker compose down
```

## Service URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health
