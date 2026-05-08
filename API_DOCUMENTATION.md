# API Reference

All requests go through the API Gateway at `http://localhost:8080`.

The frontend `apiService` in [`frontend/src/services/api.ts`](frontend/src/services/api.ts) is the canonical client and should be your first reference if this doc and the code disagree — code wins.

## Authentication model

- **Access token (JWT, HS256)** — returned in the JSON body of `/api/auth/login` and `/api/auth/refresh`. Held in memory by the SPA. Sent as `Authorization: Bearer <token>` on protected requests.
- **Refresh token** — never visible to JS. Issued as an `HttpOnly; Secure; SameSite=Lax/Strict` cookie scoped to `/api/auth`. Sent automatically by the browser on refresh and logout.
- **CSRF** — required on `/api/auth/refresh` and `/api/auth/logout`. The server sets `XSRF-TOKEN`; the client must echo it in `X-XSRF-TOKEN`. Call `GET /api/auth/csrf` once before the first protected POST to prime the cookie.
- **Roles** — `VOLUNTEER`, `ORGANIZER`, `ADMIN`. Encoded as `role` claim in the access token.

Public endpoints (no auth): `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/csrf`, `/api/public/events/{slug}`, `/uploads/**`.

## Response shapes

Errors are always JSON: `{ "error": "human-readable message" }`. Validation failures include `{ "error": "Validation failed.", "fields": { "field": "message" } }`. The frontend reads `err.response?.data?.error` for toasts.

---

## Auth

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/auth/csrf` | none | Primes the `XSRF-TOKEN` cookie. Call once before refresh/logout. |
| `POST` | `/api/auth/register` | none | `{ username, email, password, phoneNumber }`. Returns user. Password rules: ≥10 chars, letters + digits, not in denylist. |
| `POST` | `/api/auth/login` | none | `{ email, password }`. Returns `{ tokens: { accessToken }, user }` and sets refresh cookie. **Locks** for 15 min after 5 failures. **Rejects** INACTIVE users with the same generic message. |
| `POST` | `/api/auth/refresh` | refresh cookie + CSRF | No body. Returns the same shape as login, rotates the refresh token. |
| `POST` | `/api/auth/logout` | refresh cookie + CSRF | No body. Revokes the refresh token and clears the cookie. |
| `POST` | `/api/auth/change-password` | bearer | `{ currentPassword, newPassword }`. |
| `POST` | `/api/auth/forgot-password` | none | `{ email }`. Always returns 200 (no enumeration). Reset link mailed via notification-service. |
| `POST` | `/api/auth/reset-password` | none | `{ resetToken, newPassword }`. Token good for 30 minutes, single-use. |

## Users

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/users/me` | bearer | Current user's profile. Alias of `/api/users/profile`. |
| `PUT` | `/api/users/me` | bearer | Self-service update. `role` and `status` are silently nulled — only admins can change those. |
| `GET` | `/api/users` | ADMIN | List all. Optional `?role=VOLUNTEER\|ORGANIZER\|ADMIN`. |
| `GET` | `/api/users/{id}` | ADMIN | One user. |
| `PUT` | `/api/users/{id}` | ADMIN | Partial update. Body may include any of `username`, `email`, `phoneNumber`, `role`, `status`. Each is applied only if non-null. Records an audit-log entry. |
| `DELETE` | `/api/users/{id}` | ADMIN | Hard delete. Records an audit-log entry. |

## Events

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/events` | ORGANIZER, ADMIN | Create. Returns the event including its generated `slug`. |
| `GET` | `/api/events` | bearer | List. `?upcoming=true` filters to future open events. |
| `GET` | `/api/events/{id}` | bearer | One event. |
| `PUT` | `/api/events/{id}` | organizer of event, or ADMIN | Update. |
| `DELETE` | `/api/events/{id}` | organizer of event, or ADMIN | Delete. |
| `GET` | `/api/events/organizer/my-events` | ORGANIZER, ADMIN | Events the caller organizes. |
| `POST` | `/api/events/{id}/cover` | organizer of event, or ADMIN | Multipart `file` upload. JPEG/PNG/WebP, ≤5MB. Returns `{ coverImageUrl }`. |

### Public

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/public/events/{slug}` | none | Redacted projection — no organizer email, no participant list. Used by the `/e/{slug}` share page. |

## Participation

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/participations/events/{eventId}/register` | VOLUNTEER | Atomically reserves a slot. Returns 4xx if event is full or not OPEN. Broadcasts a WebSocket update. |
| `POST` | `/api/participations/events/{eventId}/cancel` | VOLUNTEER | Releases the slot. Broadcasts a WebSocket update. |
| `GET` | `/api/participations/me` | bearer | Caller's participation history. (Alias `/my-participations` exists.) |
| `GET` | `/api/participations/events/{eventId}/participants` | organizer of event, or ADMIN | Roster. (Alias `/events/{eventId}` exists.) |
| `PUT` | `/api/participations/{participationId}/mark-attended` | organizer of event, or ADMIN | Mark a single participation as attended. |

## Feedback

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/feedbacks/events/{eventId}/submit` | VOLUNTEER (must have ATTENDED) | `{ rating: 1..5, comment? }`. |
| `GET` | `/api/feedbacks/events/{eventId}` | bearer | All feedback for the event. |
| `GET` | `/api/feedbacks/events/{eventId}/average-rating` | bearer | Returns a number. |

## Notifications

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/notifications` | bearer | Caller's notifications, newest first. |
| `GET` | `/api/notifications/unread` | bearer | Unread only. |
| `PUT` | `/api/notifications/{id}/read` | bearer | Mark one as read. |
| `PUT` | `/api/notifications/read-all` | bearer | Mark all as read. |

## Admin

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/admin/audit-log` | ADMIN | Paged. `?page=0&size=25&actionPrefix=USER_`. |

## WebSocket

- **Endpoint**: `ws://localhost:8082/ws` (SockJS handshake URL — direct to event-service, not via gateway)
- **Auth**: STOMP CONNECT frame must carry `Authorization: Bearer <accessToken>`
- **Topic**: `/topic/events/{eventId}` — receives `{ eventId, registeredVolunteers, requiredVolunteers, status, kind: 'REGISTERED'|'CANCELLED'|'UPDATED'|'DELETED', at }` whenever the underlying event changes.

## File serving

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/uploads/{filename}` | none | Serves cover images stored by the upload endpoint. Cached 1 hour. |

## Internal (service-to-service)

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/internal/users/sync` | `X-Internal-Token` header | Called by user-service after a profile change to refresh denormalized email/username on event-service rows. |
| `POST` | `/api/notifications` | `X-Internal-Token` header | Called by user-service / event-service to dispatch a notification. |

## Health & metrics

Each business service exposes:

- `/actuator/health` — overall
- `/actuator/health/liveness` — Kubernetes liveness probe
- `/actuator/health/readiness` — readiness probe (includes DB)
- `/actuator/info`
- `/actuator/prometheus` — scrape endpoint for Prometheus

## Rate limits

Enforced at the gateway via Resilience4j:

- `/api/auth/**` — 50 requests/min
- `/api/participations/**` — 100 requests/min

A breach returns `429 Too Many Requests` with no body.
