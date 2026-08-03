# Setup and Run Instructions

## Prerequisites
- Docker Desktop installed and running
- Node.js 20+ and npm installed
- Java 21 installed
- Maven 3.9+ installed

## Local development with Docker
1. Copy `.env.example` to `.env` and update values as needed.
2. Start the full stack:
   ```bash
   docker compose up --build
   ```
3. Backend will be available at `http://localhost:8081`.
4. Frontend will be available at `http://localhost:4173`.

## Running backend locally without Docker
1. Create `.env` from `.env.example`.
2. Run PostgreSQL and Redis locally or use Docker Compose services.
3. Start backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

## Running frontend locally without Docker
1. Create `frontend/.env` from `frontend/.env.example`.
2. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Notes
- The backend profile defaults to `dev` unless `SPRING_PROFILES_ACTIVE` is set.
- The frontend uses `VITE_API_BASE_URL` to talk to the backend.
