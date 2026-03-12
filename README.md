# CinemoR

Cinema ticket booking system: React frontend + Spring Boot API.

## Quick start

### 1. Backend (API)

- **Requirements:** Java 17, Maven, PostgreSQL
- Create DB: `cinemor-api`
- Configure `cinemor-api/src/main/resources/application.properties` (DB, etc.)
- Run:
  ```bash
  cd cinemor-api
  mvnw.cmd spring-boot:run
  ```
- API: `http://localhost:8081` (or the port in `server.port`)

### 2. Frontend (React)

- **Requirements:** Node.js 18+
- Install and run:
  ```bash
  cd cinemor-react
  npm install
  npm run dev
  ```
- App: `http://localhost:5173`

### Environment (frontend)

- Optional: create `.env` in `cinemor-react/`:
  - `VITE_API_URL=http://localhost:8081/api` – API base URL
  - `VITE_API_URL_WITHOUT_API=http://localhost:8081` – base without `/api`
- Defaults point to `http://localhost:8081`.

## Repo layout

- `cinemor-api/` – Spring Boot REST API (see its README)
- `cinemor-react/` – Vite + React SPA

## Production (canlıya alma)

- **Frontend:** Netlify’da deploy edildi → https://cinemor.netlify.app
- **API:** Render veya Railway’da deploy etmen ve Netlify’da `VITE_API_URL` / `VITE_API_URL_WITHOUT_API` tanımlaman gerekir.
- Adım adım rehber: **[DEPLOY.md](./DEPLOY.md)**
