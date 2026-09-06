# Carnode

A full-stack car rental platform built with Node.js, React, Keycloak, and MongoDB.

![alt text](/img/Carnode.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Keycloak Setup Tutorial](#keycloak-setup-tutorial)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Frontend Routes](#frontend-routes)
- [Testing](#testing)
- [Docker](#docker)
- [Contributing](#contributing)

---

## Features

- **User Authentication**: Keycloak-based SSO with JWT tokens and role-based access control (user/admin)
- **Car Management**: Browse cars by category (Economy, Compact, SUV, Luxury, Pickup, Van), admin CRUD
- **Store Locations**: View and manage rental store locations
- **Reservations**: Book cars with pickup/return dates, check availability, manage reservation status
- **Admin Panel**: Full CRUD for users, cars, stores, and reservations with data tables, search, and filtering
- **Responsive UI**: Dark theme with amber/green accents, glassmorphism effects, and scroll animations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 22, Express 5, TypeScript (ESM) |
| Frontend | React 19, Vite 8, TypeScript 6, Tailwind CSS 4, shadcn/ui |
| Database | MongoDB 8 (application), PostgreSQL 17 (Keycloak) |
| Auth | Keycloak (latest), keycloak-js 26 |
| Validation | Zod 4 |
| State | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod resolvers |
| Testing | Vitest 4, Supertest 7, mongodb-memory-server |
| Container | Docker + Docker Compose |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [Docker](https://www.docker.com/) and Docker Compose
- [MongoDB](https://www.mongodb.com/) (or use Docker)
- [Keycloak](https://www.keycloak.org/) (or use Docker)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/carnode.git
cd carnode
```

### 2. Start infrastructure services

```bash
docker-compose up -d keycloak keycloak-db carnode-db
```

This starts:
- **Keycloak** on `http://localhost:8080` (admin: `admin`/`admin`)
- **PostgreSQL** (Keycloak DB) on port 5433
- **MongoDB** on port 27017

### 3. Set up Keycloak (see [Keycloak Setup Tutorial](#keycloak-setup-tutorial))

### 4. Configure environment variables

Copy the example env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your Keycloak client secret (see tutorial below).

### 5. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app is now running:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`
- Keycloak Admin: `http://localhost:8080`

---

## Keycloak Setup Tutorial

This section walks you through creating the required Keycloak clients and roles from scratch.

### Step 1: Access the Keycloak Admin Console

1. Open `http://localhost:8080` in your browser
2. Click **Administration Console**
3. Log in with:
   - **Username**: `admin`
   - **Password**: `admin`

### Step 2: Create the `carnode` Realm

1. Click the dropdown in the top-left corner (currently says **master**)
2. Click **Create realm**
3. Fill in:
   - **Name**: `carnode`
4. Click **Create**

### Step 3: Create Realm Roles

1. In the left sidebar, go to **Realm roles**
2. Click **Create role**
3. Create a role named `user` and click **Create**
4. Click **Create role** again
5. Create a role named `admin` and click **Create**

### Step 4: Create the `user-service` Client (Backend)

This client is used by the backend to manage users via Keycloak's Admin API.

1. In the left sidebar, go to **Clients**
2. Click **Create client**
3. Fill in:
   - **Client type**: `OpenID Connect`
   - **Client ID**: `user-service`
4. Click **Next**
5. On the **Capability config** step:
   - Turn **ON** the **Service accounts** toggle
6. Click **Next**
7. On the **Login settings** step, leave everything default
8. Click **Save**

### Step 5: Configure `user-service` Client Roles

1. Stay on the `user-service` client page
2. Go to the **Service account roles** tab
3. Under **Client roles**, select **realm-management** from the dropdown
4. You'll see a list of available roles. Add these roles to the service account:
   - `manage-users` — Click the role, then click **Add selected**
   - `view-users` — Click the role, then click **Add selected**

### Step 6: Get the Client Secret

1. Stay on the `user-service` client page
2. Go to the **Credentials** tab
3. Copy the **Client Secret** value

### Step 7: Update `backend/.env`

Open `backend/.env` and replace the `KEYCLOAK_CLIENT_SECRET` value:

```env
KEYCLOAK_BASE_URI=http://localhost:7080
KEYCLOAK_CLIENT_ID=user-service
KEYCLOAK_CLIENT_SECRET=<paste-your-secret-here>
KEYCLOAK_REALM=carnode
KEYCLOAK_ISSUER=http://localhost:7080/realms/carnode
```

### Step 8: Create the `react-frontend` Client (Frontend)

This client is used by the React frontend for browser-based SSO login.

1. Go to **Clients** → **Create client**
2. Fill in:
   - **Client type**: `OpenID Connect`
   - **Client ID**: `react-frontend`
3. Click **Next**
4. On the **Capability config** step:
   - Turn **OFF** the **Service accounts** toggle
5. Click **Next**
6. On the **Login settings** step:
   - **Valid redirect URIs**: Add `http://localhost:5173/*`
   - **Web origins**: Add `http://localhost:5173`
7. Click **Save**

### Step 9: Update `frontend/.env`

Open `frontend/.env` and update the Keycloak URI:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_KEYCLOAK_BASE_URI=http://localhost:7080
VITE_KEYCLOAK_REALM=carnode
VITE_KEYCLOAK_CLIENT_ID=react-frontend
```

### Step 10: Create an Admin User (Optional)

1. Go to **Users** → **Add user**
2. Fill in:
   - **Username**: `admin`
   - **Email**: `admin@carnode.com`
   - **Email Verified**: ON
3. Click **Create**
4. Go to the **Credentials** tab
5. Set a password (e.g., `admin`), turn OFF **Temporary**
6. Click **Set password**
7. Go to the **Role mapping** tab
8. Click **Assign role**
9. Select the `admin` role and assign it

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `KEYCLOAK_BASE_URI` | Yes | Keycloak server URL (e.g., `http://localhost:7080`) |
| `KEYCLOAK_CLIENT_ID` | Yes | Backend client ID (e.g., `user-service`) |
| `KEYCLOAK_CLIENT_SECRET` | Yes | Client secret from Keycloak credentials tab |
| `KEYCLOAK_REALM` | Yes | Keycloak realm name (e.g., `carnode`) |
| `KEYCLOAK_ISSUER` | Yes | JWT issuer URL (e.g., `http://localhost:7080/realms/carnode`) |
| `MONGODB_URI` | Yes | MongoDB connection URI |
| `MONGODB_DATABASE` | Yes | MongoDB database name |
| `SEED_DATA` | No | Seed database on startup (`true`/`false`, default: `false`) |
| `PORT` | No | Server port (default: `3000`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL (e.g., `http://localhost:3000/api/v1`) |
| `VITE_KEYCLOAK_BASE_URI` | Yes | Keycloak server URL (e.g., `http://localhost:7080`) |
| `VITE_KEYCLOAK_REALM` | Yes | Keycloak realm name (e.g., `carnode`) |
| `VITE_KEYCLOAK_CLIENT_ID` | Yes | Frontend client ID (e.g., `react-frontend`) |

---

## Architecture

### Backend

The backend follows a **modular Clean Architecture** pattern:

```
backend/src/modules/
├── shared/           # Shared middleware, HTTP client, pagination, error handling
├── users/            # User management (Keycloak + MongoDB)
├── cars/             # Car inventory management
├── stores/           # Store location management
└── reserves/         # Reservation management
```

Each module contains:

- `domain/` — Entities, repository interfaces, error types
- `service/` — Business logic
- `controller/` — HTTP request/response handling
- `routes/` — Express router definitions
- `schema/` — Zod validation schemas
- `dto/` — Data transfer objects (request/response mappers)
- `infrastructure/` — MongoDB repositories, Keycloak provider
- `container.ts` — Dependency injection wiring

### Frontend

The frontend is organized by **feature modules**:

```
frontend/src/features/
├── auth/             # Login, registration, Keycloak integration
├── users/            # User data fetching and management
├── cars/             # Car browsing and booking
├── stores/           # Store locations
├── reserves/         # Reservation management
├── admin/            # Admin panel (CRUD for all entities)
└── home/             # Homepage components
```

Each feature contains `api/`, `hooks/`, `components/`, `pages/`, `schemas/`, and `types.ts`.

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |

### Users

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/users` | No | — | Register new user |
| GET | `/users/me` | Yes | user | Get current user profile |
| GET | `/users` | Yes | admin | List users (paginated) |
| GET | `/users/search` | Yes | admin | Search users by email |
| GET | `/users/:id` | Yes | admin | Get user by ID |
| PATCH | `/users/:id/email` | Yes | admin | Update user email |
| PATCH | `/users/:id/password` | Yes | admin | Change user password |
| DELETE | `/users/:id` | Yes | admin | Delete user |

### Cars

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/cars` | No | — | List available cars (paginated) |
| GET | `/cars/admin` | Yes | admin | List all cars (paginated) |
| GET | `/cars/:id` | Yes | — | Get car by ID |
| POST | `/cars` | Yes | admin | Create car |
| PATCH | `/cars/:id` | Yes | admin | Update car |
| PATCH | `/cars/:id/status` | Yes | admin | Update car status |
| DELETE | `/cars/:id` | Yes | admin | Soft-delete car |

### Stores

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/stores` | No | — | List stores |
| GET | `/stores/search` | No | — | Search stores |
| GET | `/stores/:id` | Yes | admin | Get store by ID |
| POST | `/stores` | Yes | admin | Create store |
| PATCH | `/stores/:id` | Yes | admin | Update store |
| DELETE | `/stores/:id` | Yes | admin | Delete store |

### Reserves

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/reserves/me` | Yes | user | Get my reservations |
| POST | `/reserves/me` | Yes | user | Create reservation |
| GET | `/reserves` | Yes | admin | List all reservations |
| GET | `/reserves/available-cars` | No | — | Check car availability |
| GET | `/reserves/:id` | Yes | — | Get reservation by ID |
| POST | `/reserves` | Yes | admin | Create reservation (admin) |
| PATCH | `/reserves/:id/status` | Yes | — | Update reservation status |
| PATCH | `/reserves/:id` | Yes | admin | Update reservation details |

---

## Frontend Routes

### Public Routes

| Path | Description |
|------|-------------|
| `/` | Homepage with search form, benefits, fleet preview |
| `/cars` | Browse all cars by category |
| `/available-cars` | Cars available for selected dates |
| `/stores` | View all store locations |
| `/auth` | Login page (Keycloak SSO) |
| `/register` | User registration form |

### Authenticated Routes

| Path | Description |
|------|-------------|
| `/reserves` | View and manage personal reservations |

### Admin Routes

| Path | Description |
|------|-------------|
| `/admin` | Admin dashboard |
| `/admin/users` | Manage users |
| `/admin/users/:userId` | User detail/edit |
| `/admin/cars` | Manage cars |
| `/admin/cars/new` | Create car |
| `/admin/cars/:carId` | Car detail |
| `/admin/cars/:carId/edit` | Edit car |
| `/admin/stores` | Manage stores |
| `/admin/stores/new` | Create store |
| `/admin/stores/:storeId` | Store detail |
| `/admin/stores/:storeId/edit` | Edit store |
| `/admin/reserves` | Manage reservations |
| `/admin/reserves/new` | Create reservation |
| `/admin/reserves/:reserveId` | Reservation detail |
| `/admin/reserves/:reserveId/edit` | Edit reservation |

---

## Testing

The backend uses **Vitest** with both unit and integration tests.

### Run Tests

```bash
cd backend

# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Coverage Thresholds

- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

### Test Structure

```
backend/tests/
├── unit/                          # Unit tests (mocked dependencies)
│   └── modules/{users,cars,stores,reserves,shared}/
│       ├── service/*.test.ts
│       ├── controller/*.test.ts
│       ├── schema/*.test.ts
│       └── domain/errors/*.test.ts
└── integration/                   # Integration tests (real MongoDB)
    ├── test-database.ts           # MongoMemoryServer setup
    └── modules/{users,cars,stores,reserves}/
        ├── *.repository.integration.test.ts
        ├── *.service.integration.test.ts
        └── *.http.integration.test.ts
```

---

## Docker

### Start All Services

```bash
docker-compose up
```

This starts:
- **backend** — `http://localhost:3000`
- **keycloak** — `http://localhost:8080`
- **keycloak-db** — PostgreSQL on port 5433
- **carnode-db** — MongoDB on port 27017

### Start Only Infrastructure

```bash
docker-compose up -d keycloak keycloak-db carnode-db
```

### Rebuild Backend

```bash
docker-compose up --build backend
```

### View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f keycloak
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

### Development Workflow

- The backend uses `tsx watch` for hot reload during development
- Run `npm run lint` before committing
- Ensure all tests pass with `npm run test:run`
- Coverage thresholds must be met

### Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch for features
- Feature branches — `feature/*`, `fix/*`, `chore/*`

---

## License

This project is licensed under the MIT License.
