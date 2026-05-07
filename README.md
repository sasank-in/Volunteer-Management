# Volunteer Management Platform

A microservices-based platform for coordinating volunteer events, participation, and notifications. Spring Boot + PostgreSQL + React.

## Architecture

Six Spring Boot services + a React frontend, all gated by an API gateway.

| Service | Port | Role |
|---|---|---|
| `config-server` | 8888 | Centralised Spring Cloud config (reads from `backend/config-repo/`) |
| `discovery-server` | 8761 | Eureka service registry |
| `api-gateway` | 8080 | Single entry point — CORS, rate limiting on `/api/auth/**` and `/api/participations/**` |
| `user-service` | 8081 | Auth (JWT + httpOnly refresh cookie + CSRF), accounts, password reset |
| `event-service` | 8082 | Events, participation, feedback. Atomic capacity reservation. |
| `notification-service` | 8083 | Async email + in-app notifications |
| `frontend` | 5173 | React + TypeScript + Vite + MUI |

### Stack

**Backend:** Java 21, Spring Boot 3.4.2, Spring Cloud 2024.0.1, PostgreSQL 16, Flyway, Resilience4j (circuit breaker + rate limiter), Micrometer + Prometheus, Logstash JSON encoder.

**Frontend:** React 18, TypeScript, Vite 5, MUI 5 (custom corporate theme), Zustand, React Query, axios.

**Infra:** Docker Compose (Postgres, Redis, Prometheus, Grafana). Tests use Testcontainers.

## Prerequisites

- JDK 21
- Maven 3.9+
- Docker (for Postgres + integration tests)
- Node 20+ + npm (for frontend)

## Quick start

### 1. Bring up infra

```bash
docker compose -f infra/docker-compose.yml up -d db redis
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env: set DB_USER, DB_PASSWORD, JWT_SECRET (32-byte Base64), and CORS / mail values.
```

Generate a JWT secret:
```bash
openssl rand -base64 32
```

### 3. Create the three databases

```sql
CREATE DATABASE volunteer_user_db;
CREATE DATABASE volunteer_event_db;
CREATE DATABASE volunteer_notification_db;
```

(Or run them manually via your psql client. Flyway will create the schemas on first boot.)

### 4. Start backend services

**Windows:**
```bat
start.bat
```

**Linux / macOS:**
```bash
cd backend
( cd config-server     && mvn spring-boot:run ) &
sleep 15
( cd discovery-server  && mvn spring-boot:run ) &
sleep 10
( cd user-service          && mvn spring-boot:run ) &
( cd event-service         && mvn spring-boot:run ) &
( cd notification-service  && mvn spring-boot:run ) &
( cd api-gateway           && mvn spring-boot:run ) &
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 6. Sign in with seeded demo accounts

The `user-service` seeds three demo accounts on first startup (toggle with `DEMO_SEED_ENABLED=false`):

| Role | Email | Password |
|---|---|---|
| Volunteer | `volunteer@example.com` | `Demo-Volunteer-1` |
| Organizer | `organizer@example.com` | `Demo-Organizer-1` |
| Admin | `admin@example.com` | `Demo-Admin-1` |

The login page has demo-cred buttons that pre-fill these.

## Verification

- Eureka: http://localhost:8761
- API Gateway: http://localhost:8080
- Swagger (user-service): http://localhost:8081/swagger-ui.html
- Prometheus (if started): http://localhost:9090
- Grafana (if started): http://localhost:3001

## Configuration reference

All env vars are documented in [`.env.example`](.env.example). Highlights:

| Var | Default | Purpose |
|---|---|---|
| `DB_USER` / `DB_PASSWORD` | — | Single Postgres user across all 3 dbs |
| `JWT_SECRET` | — | Base64 of ≥32 random bytes (HS256) |
| `JWT_EXPIRES_IN` | 3600 | Access-token TTL (seconds) |
| `AUTH_COOKIE_SECURE` | `false` | Set `true` in prod (HTTPS). Refresh cookie is HttpOnly + path-scoped to `/api/auth`. |
| `AUTH_COOKIE_SAME_SITE` | `Lax` | `Strict` recommended in prod |
| `APP_CORS_ALLOWED_ORIGINS` | `localhost:3000,5173` | Comma-separated frontend origins |
| `APP_CACHE_TYPE` | `in-memory` | Set `redis` once running >1 event-service instance |
| `REDIS_HOST` / `REDIS_PORT` | `localhost`/`6379` | Used when `APP_CACHE_TYPE=redis` |
| `MAIL_PROVIDER` | `smtp` | `log` for dev/CI |
| `DEMO_SEED_ENABLED` | `true` | Disable in production |
| `USER_SYNC_TOKEN` | `dev-sync-token` | Shared between user→event service for denormalized email/name sync |
| `LOG_FORMAT` | text | `SPRING_PROFILES_ACTIVE=json` for structured logs |

## Security

- **Auth**: JWT (HS256) access tokens, HttpOnly refresh cookie scoped to `/api/auth`, CSRF protection on cookie endpoints (`CookieCsrfTokenRepository`).
- **Password rules**: ≥10 characters, must include letters and digits, denylist of common passwords. Validated server-side via `@StrongPassword` Bean Validation.
- **Account lockout**: 5 failed logins → 15 min temporary lock (configurable via `app.login.{max-attempts,lockout-minutes}`).
- **Forgot password**: returns identical 200 OK regardless of email existence (no enumeration). Reset token is sent via notification-service email — never returned in API responses.
- **Roles**: `VOLUNTEER` / `ORGANIZER` / `ADMIN`. Spring `@PreAuthorize("hasRole('ADMIN')")` guards admin endpoints.
- **Rate limiting**: Resilience4j-based gateway filters on `/api/auth/**` (50/min) and `/api/participations/**` (100/min).
- **Secrets**: `.env` is gitignored. Never commit. For prod, rotate JWT secret + DB password + mail credentials.

## Operations

### Tests

```bash
# Unit tests (no Docker needed)
( cd backend/user-service && mvn test )

# Integration tests (Testcontainers — Docker required)
( cd backend/user-service  && mvn verify )
( cd backend/event-service && mvn verify )
```

### Observability

Each business service exposes Prometheus metrics at `/actuator/prometheus`. Scrape config and 5 baseline alert rules (ServiceDown, HighErrorRate, SlowEndpoint, CircuitBreakerOpen, DBPoolNearExhausted) are in `infra/prometheus.yml` and `infra/alerts.yml`.

Bring up the full observability stack:
```bash
docker compose -f infra/docker-compose.yml up -d prometheus grafana
```

### Health probes

Each service exposes:
- `/actuator/health` — overall status
- `/actuator/health/liveness` — for Kubernetes liveness probe
- `/actuator/health/readiness` — includes DB connectivity for readiness probe

### Token cleanup

`user-service` has a scheduled hourly job (`TokenCleanupJob`) that prunes expired refresh tokens and tokens revoked/used > 7 days ago. Logs counts when non-zero.

### Cross-service user sync

When a user updates their email or username, `user-service` POSTs to `event-service`'s `POST /api/internal/users/sync` (gated by `X-Internal-Token`) which updates the denormalized `organizer_email` / `volunteer_email` columns. Best-effort — failures are logged. Production upgrade: replace with an outbox table + async flusher.

## Project layout

```
.
├── backend/
│   ├── pom.xml                       # Aggregator parent POM
│   ├── config-repo/                  # Centralised service configs
│   │   ├── api-gateway.yml
│   │   ├── user-service.yml
│   │   ├── event-service.yml
│   │   └── notification-service.yml
│   ├── config-server/                # Spring Cloud Config
│   ├── discovery-server/             # Eureka
│   ├── api-gateway/                  # Spring Cloud Gateway + rate limiting
│   ├── user-service/                 # Auth, users, password reset
│   ├── event-service/                # Events, participation, feedback
│   └── notification-service/         # Email + in-app notifications
├── frontend/                         # React + TS + Vite app
│   ├── src/
│   │   ├── components/               # Layout, AuthLayout, PageHeader, StatusChip, etc.
│   │   ├── pages/                    # Route components
│   │   ├── services/api.ts           # axios + auth flow
│   │   ├── store/                    # Zustand stores
│   │   ├── theme/                    # MUI theme (corporate B2B)
│   │   └── types/                    # Shared TS types
│   └── public/favicon.svg
├── infra/
│   ├── docker-compose.yml            # Postgres, Redis, Prometheus, Grafana
│   ├── prometheus.yml                # Scrape config
│   └── alerts.yml                    # 5 baseline alert rules
├── .env.example                      # Env var template
├── start.bat                         # Windows launcher
└── README.md
```

## Known limitations

These are **not** production-ready:

- **Database backups** — none configured. Single Postgres container.
- **Email provider** — defaults to Gmail SMTP; will be throttled at any meaningful load. Swap `MailSender` impl with SES/SendGrid/Postmark for production.
- **Cache** — defaults to in-memory; switch to Redis (`APP_CACHE_TYPE=redis`) before scaling event-service horizontally.
- **CI/CD** — no pipeline configured. Tests do not run on push.
- **Frontend bundle** — split into 4 chunks but not lazy-loaded per route.
- **Mobile UX** — tables scroll horizontally on phones; otherwise responsive but unverified at every breakpoint.
- **Pen test, load test** — neither has been done.

See [CLAUDE.md] (if present) for the chronological record of hardening passes.

## License

Educational purposes.
