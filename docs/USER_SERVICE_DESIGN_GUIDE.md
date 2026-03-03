# User Service Design Guide

**Version:** 1.0  
**Last Updated:** March 2, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [API Endpoints](#api-endpoints)
5. [Design Patterns](#design-patterns)
6. [Security](#security)
7. [Database Design](#database-design)
8. [Request Flows](#request-flows)
9. [Configuration](#configuration)
10. [Error Handling](#error-handling)

---

## Overview

The **User Service** is a Spring Boot microservice responsible for:
- User registration and authentication
- JWT token management (access & refresh tokens)
- Password management (hashing, reset, change)
- User profile management
- Role-based access control (VOLUNTEER, ORGANIZER, ADMIN)

**Port:** 8081  
**Database:** PostgreSQL (volunteer_user_db)  
**Authentication:** JWT with HS256

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────┐
│         Client Application                      │
│        (Frontend / Mobile App)                  │
└────────────────────┬────────────────────────────┘
                     │
                     ↓ HTTP REST
┌─────────────────────────────────────────────────┐
│         API Gateway (8080)                      │
│     (Routes to User Service)                    │
└────────────────────┬────────────────────────────┘
                     │
                     ↓ HTTP (localhost:8081)
┌─────────────────────────────────────────────────┐
│         User Service (Port 8081)                │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Web Layer (REST Controllers)            │  │
│  │  - AuthController                        │  │
│  │  - UserController                        │  │
│  │  - ApiExceptionHandler                   │  │
│  └────────────┬─────────────────────────────┘  │
│               ↓                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Service Layer (Business Logic)          │  │
│  │  - UserAccountService                    │  │
│  │  - AuthTokenService                      │  │
│  │  - JwtTokenService                       │  │
│  │  - UserDetailsServiceImpl                 │  │
│  └────────────┬─────────────────────────────┘  │
│               ↓                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Repository Layer (Data Access)          │  │
│  │  - UserAccountRepository                 │  │
│  │  - RefreshTokenRepository                │  │
│  │  - PasswordResetTokenRepository          │  │
│  └────────────┬─────────────────────────────┘  │
│               ↓                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Domain Layer (JPA Entities)             │  │
│  │  - UserAccount                           │  │
│  │  - RefreshToken                          │  │
│  │  - PasswordResetToken                    │  │
│  │  - Role                                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Config Layer                            │  │
│  │  - SecurityConfig                        │  │
│  │  - JwtKeyProvider                        │  │
│  │  - JwtProperties                         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     │
                     ↓ JDBC
         ┌───────────────────────┐
         │   PostgreSQL Database │
         │  (volunteer_user_db)  │
         └───────────────────────┘
```

### Layering Strategy

The User Service follows **5-layer architecture**:

| Layer | Purpose | Examples |
|-------|---------|----------|
| **Web Layer** | REST endpoints, request/response handling | Controllers, DTOs, Exception Handler |
| **Service Layer** | Business logic, validation | User operations, token management |
| **Repository Layer** | Database access abstraction | JPA Repositories, custom queries |
| **Domain Layer** | Entity models, domain logic | User, Token, Role entities |
| **Config Layer** | Spring configuration | Security, JWT, Properties |

---

## Core Components

### 1. Web Layer

#### Controllers

**AuthController** (`/api/auth`)
- Handles authentication operations
- Endpoints: register, login, refresh, logout, forgot-password, reset-password, change-password

**UserController** (`/api/users`)
- Handles user profile operations
- Endpoints: get user, list users, update user, delete user, assign role

#### Data Transfer Objects (DTOs)

**Requests:**
- `RegisterRequest` - User registration input
- `LoginRequest` - Login credentials
- `RefreshRequest` - Token refresh request
- `UpdateUserRequest` - User profile update
- `ChangePasswordRequest` - Password change
- `ForgotPasswordRequest` - Password reset initiation
- `ResetPasswordRequest` - Password reset completion

**Responses:**
- `AuthResponse` - Login/refresh response with tokens
- `UserResponse` - User data response

#### Exception Handler

**ApiExceptionHandler** (`@RestControllerAdvice`)
- Centralized error handling
- Catches validation errors, authentication errors, general exceptions
- Returns consistent error response format

### 2. Service Layer

**UserAccountService**
```java
// User operations
- register(RegisterRequest) → UserAccount
- findByUsernameOrEmail(value) → Optional<UserAccount>
- findByEmail(email) → Optional<UserAccount>
- findById(id) → Optional<UserAccount>
- findAll() → List<UserAccount>
- findAllByRole(role) → List<UserAccount>
- updateUser(id, request) → UserAccount
- deleteUser(id) → void
- changePassword(principal, oldPassword, newPassword) → void
- setPassword(userId, newPassword) → void
```

**AuthTokenService**
```java
// Token lifecycle management
- storeRefreshToken(account, token, expiresAt) → void
- revokeRefreshToken(token) → void
- getValidRefreshToken(token) → RefreshToken
- createPasswordResetToken(account) → String (raw token)
- usePasswordResetToken(token) → void
- getAccountForResetToken(token) → UserAccount
```

**JwtTokenService**
```java
// JWT token generation
- generateAccessToken(account) → String (1-hour token)
- generateRefreshToken(account) → String (7-day token)
```

**UserDetailsServiceImpl**
```java
// Spring Security integration
- loadUserByUsername(username) → UserDetails
```

### 3. Repository Layer

**UserAccountRepository**
```java
extends JpaRepository<UserAccount, UUID>

// Custom methods
- existsByUsernameIgnoreCase(username) → boolean
- existsByEmailIgnoreCase(email) → boolean
- findByUsernameIgnoreCase(username) → Optional<UserAccount>
- findByEmailIgnoreCase(email) → Optional<UserAccount>
- findByRole(role) → List<UserAccount>
```

**RefreshTokenRepository**
```java
extends JpaRepository<RefreshToken, UUID>

// Custom methods
- findByTokenHash(hash) → Optional<RefreshToken>
```

**PasswordResetTokenRepository**
```java
extends JpaRepository<PasswordResetToken, UUID>

// Custom methods
- findByTokenHash(hash) → Optional<PasswordResetToken>
```

### 4. Domain Layer (JPA Entities)

**UserAccount**
```java
@Entity
@Table(name = "user_accounts")

Fields:
- id: UUID (primary key)
- username: String (unique, case-insensitive)
- email: String (unique, case-insensitive)
- passwordHash: String (BCrypt encoded)
- role: Role (VOLUNTEER, ORGANIZER, ADMIN)
- phoneNumber: String (optional)
- createdAt: Instant (auto-set on creation)
- updatedAt: Instant (auto-updated)
```

**RefreshToken**
```java
@Entity
@Table(name = "refresh_tokens")

Fields:
- id: UUID (primary key)
- userId: UUID (foreign key)
- tokenHash: String (SHA-256 hashed)
- createdAt: Instant
- expiresAt: Instant
- revokedAt: Instant (nullable - null means active)
```

**PasswordResetToken**
```java
@Entity
@Table(name = "password_reset_tokens")

Fields:
- id: UUID (primary key)
- userId: UUID (foreign key)
- tokenHash: String (SHA-256 hashed)
- createdAt: Instant
- expiresAt: Instant (30 minutes from creation)
- usedAt: Instant (nullable - null means not used yet)
```

**Role**
```java
enum Role {
  VOLUNTEER,    // Regular volunteer
  ORGANIZER,    // Event organizer
  ADMIN         // System administrator
}
```

### 5. Config Layer

**SecurityConfig**
- Configures Spring Security
- Defines authentication manager
- Enables JWT validation
- Sets up stateless session management
- Disables CSRF (appropriate for stateless JWT)

**JwtKeyProvider**
- Generates/provides HS256 symmetric key
- Reads JWT_SECRET from environment variables
- Used by both encoder and decoder

**JwtProperties**
- Externalized JWT configuration
- Issuer, secret, expiration times
- Bound via @ConfigurationProperties

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "+1234567890"
}

Response (201 Created):
{
  "id": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "VOLUNTEER",
  "phoneNumber": "+1234567890",
  "createdAt": "2026-03-02T08:00:00Z"
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200 OK):
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "username": "john_doe",
    "email": "john@example.com",
    "role": "VOLUNTEER",
    "id": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
  }
}
```

#### 3. Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": { ... }
}
```

#### 4. Logout
```
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer {accessToken}

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "message": "Logged out."
}
```

#### 5. Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "john@example.com"
}

Response (200 OK):
{
  "message": "Password reset token created.",
  "reset_token": "abc123...xyz789" (base64 encoded 48-byte token)
}
```

#### 6. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

Request Body:
{
  "resetToken": "abc123...xyz789",
  "newPassword": "NewSecurePassword456!"
}

Response (200 OK):
{
  "message": "Password reset successful."
}
```

#### 7. Change Password
```
POST /api/auth/change-password
Content-Type: application/json
Authorization: Bearer {accessToken}

Request Body:
{
  "currentPassword": "SecurePassword123!",
  "newPassword": "NewSecurePassword456!"
}

Response (200 OK):
{
  "message": "Password updated."
}
```

### User Management Endpoints

#### 1. Get Current User Profile
```
GET /api/users/{id}
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "id": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "VOLUNTEER",
  "phoneNumber": "+1234567890",
  "createdAt": "2026-03-02T08:00:00Z"
}
```

#### 2. List All Users
```
GET /api/users
Authorization: Bearer {accessToken}

Response (200 OK):
[
  { id, username, email, role, phoneNumber, createdAt },
  { id, username, email, role, phoneNumber, createdAt },
  ...
]
```

#### 3. Update User Profile
```
PUT /api/users/{id}
Content-Type: application/json
Authorization: Bearer {accessToken}

Request Body:
{
  "username": "john_doe_updated",
  "email": "newemail@example.com",
  "phoneNumber": "+9876543210",
  "role": "ORGANIZER"
}

Response (200 OK):
{
  "id": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
  "username": "john_doe_updated",
  "email": "newemail@example.com",
  "role": "ORGANIZER",
  "phoneNumber": "+9876543210",
  "createdAt": "2026-03-02T08:00:00Z"
}
```

#### 4. Delete User
```
DELETE /api/users/{id}
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "message": "User deleted."
}
```

#### 5. Assign Role
```
PUT /api/users/{id}/role
Content-Type: application/json
Authorization: Bearer {accessToken}

Request Body:
{
  "role": "ADMIN"
}

Response (200 OK):
{
  "id": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "ADMIN",
  "phoneNumber": "+1234567890",
  "createdAt": "2026-03-02T08:00:00Z"
}
```

---

## Design Patterns

### 1. MVC Pattern
- **Model:** JPA entities (UserAccount, tokens)
- **View:** DTOs (request/response objects)
- **Controller:** REST controllers (AuthController, UserController)

### 2. Service Locator Pattern
- Business logic centralized in service classes
- Controllers delegate to services
- Services handle validation and coordination

### 3. Repository Pattern
- Data access abstraction via JpaRepository
- Custom query methods (findByUsernameIgnoreCase, etc.)
- Decouples business logic from database implementation

### 4. Data Transfer Object (DTO) Pattern
- Separate DTOs from JPA entities
- Prevents entity leakage in API responses
- Allows flexible request/response structures

### 5. Dependency Injection
- Constructor-based DI (Spring best practice)
- All dependencies injected at instantiation
- Improves testability and loose coupling

### 6. Singleton Pattern
- Services are singletons (Spring default)
- One instance per application context
- Thread-safe through immutable dependencies

### 7. Template Method Pattern
- JpaRepository provides base CRUD operations
- Custom methods extend base functionality
- Reduces boilerplate code

### 8. Observer Pattern (Entity Lifecycle)
- `@PrePersist` - Auto-set createdAt/updatedAt
- `@PreUpdate` - Auto-update updatedAt
- Ensures audit trail consistency

---

## Security

### Password Security

**Hashing Algorithm:** BCrypt
- Adaptive work factor (automatically increases with hardware)
- Salted hashing (unique salt per password)
- One-way function (irreversible)

```java
// Example BCrypt hash
Password: "SecurePassword123!"
Hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/lFm"
```

### Token Security

**Access Token (JWT)**
- Duration: 1 hour
- Algorithm: HS256 (symmetric key)
- Claims: userId, username, role, issuer, expiry
- Used for API authentication
- Stateless (no server-side storage needed)

**Refresh Token (JWT)**
- Duration: 7 days
- Algorithm: HS256
- Stored in database (SHA-256 hashed)
- Used to obtain new access tokens
- Can be revoked

**Token Hashing**
- Refresh tokens hashed before storage
- Prevents database compromise from exposing valid tokens
- Only token hash stored, raw token sent to client

### Authentication Flow

```
1. Client sends email + password
2. Server authenticates (BCrypt comparison)
3. Server generates JWT access token (1 hour)
4. Server generates JWT refresh token (7 days)
5. Server hashes refresh token
6. Server stores hashed refresh token in DB
7. Server returns raw tokens to client (only in response)
8. Client stores tokens (access in memory, refresh in secure storage)
9. Client uses access token for API calls
10. When access token expires, client uses refresh token to get new tokens
11. Old refresh token marked as revoked
```

### Authorization

**Spring Security Integration**
- Uses `@PreAuthorize` annotations (can be added to controllers)
- Validates JWT signature on every request
- Extracts claims (userId, username, role)
- Enforces stateless session policy

**Role-Based Access Control**
```java
// Example usage (not currently implemented but ready)
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/{id}/role")
public UserResponse assignRole(...) { ... }
```

---

## Database Design

### Tables

#### user_accounts
```sql
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL,
  phone_number VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_username_lower ON user_accounts (LOWER(username));
CREATE INDEX idx_email_lower ON user_accounts (LOWER(email));
CREATE INDEX idx_role ON user_accounts (role);
```

#### refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_expires_at ON refresh_tokens (expires_at);
```

#### password_reset_tokens
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_token_hash ON password_reset_tokens (token_hash);
CREATE INDEX idx_user_id ON password_reset_tokens (user_id);
CREATE INDEX idx_expires_at ON password_reset_tokens (expires_at);
```

### Data Types

| Field | Type | Reason |
|-------|------|--------|
| id | UUID | Distributed-friendly, no collisions |
| username/email | VARCHAR | Indexed, case-insensitive searches |
| password_hash | TEXT | BCrypt hashes are variable length (~60 chars) |
| token_hash | VARCHAR(255) | SHA-256 hashes are fixed 64 characters |
| timestamps | TIMESTAMPTZ | Timezone-aware, audit trails |
| role | VARCHAR(30) | Enum stored as string for flexibility |

---

## Request Flows

### Registration Flow

```
Client                          Server                         Database
  │                              │                               │
  ├─ POST /api/auth/register ──→                                │
  │  {username, email,            │                               │
  │   password, phone}             │                               │
  │                                ├─ Validate input (@Valid)     │
  │                                │  ✓ Email format              │
  │                                │  ✓ Password strength         │
  │                                │                               │
  │                                ├─ Check duplicates             │
  │                                ├──────────────────────────→  │
  │                                │  SELECT ... WHERE username  │
  │                                │  SELECT ... WHERE email     │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Hash password (BCrypt)      │
  │                                │                               │
  │                                ├─ Create UserAccount entity   │
  │                                │  Set role = VOLUNTEER        │
  │                                │  Set timestamps              │
  │                                │                               │
  │                                ├─ Save to database            │
  │                                ├──────────────────────────→  │
  │                                │  INSERT INTO user_accounts   │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │  ← ──── UserResponse ──────────│                               │
  │   {id, username, email,        │                               │
  │    role, phone, createdAt}     │                               │
  │                                │                               │
```

### Login Flow

```
Client                          Server                         Database
  │                              │                               │
  ├─ POST /api/auth/login ──────→                                │
  │  {email, password}             │                               │
  │                                ├─ Validate input (@Valid)     │
  │                                │                               │
  │                                ├─ Load user by email          │
  │                                ├──────────────────────────→  │
  │                                │  SELECT * FROM user_accounts │
  │                                │  WHERE LOWER(email) = ?      │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Match password (BCrypt)     │
  │                                │  BCrypt.matches(plain,hash)  │
  │                                │                               │
  │                                ├─ Generate JWT tokens         │
  │                                │  HS256 + claims              │
  │                                │                               │
  │                                ├─ Hash refresh token (SHA-256)│
  │                                │                               │
  │                                ├─ Store hashed token in DB    │
  │                                ├──────────────────────────→  │
  │                                │  INSERT INTO refresh_tokens  │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │  ← ─ AuthResponse ────────────│                               │
  │   {tokens, user}              │                               │
  │   - accessToken (raw)         │                               │
  │   - refreshToken (raw)        │                               │
```

### Token Refresh Flow

```
Client                          Server                         Database
  │                              │                               │
  ├─ POST /api/auth/refresh ────→                                │
  │  {refreshToken}                │                               │
  │                                ├─ Hash provided token         │
  │                                │  SHA-256(refreshToken)       │
  │                                │                               │
  │                                ├─ Find token in DB            │
  │                                ├──────────────────────────→  │
  │                                │  SELECT * FROM refresh_tokens│
  │                                │  WHERE token_hash = ?        │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Validate token              │
  │                                │  ✓ Not revoked               │
  │                                │  ✓ Not expired               │
  │                                │                               │
  │                                ├─ Decode JWT claims           │
  │                                │  Extract user ID             │
  │                                │                               │
  │                                ├─ Load fresh user data        │
  │                                ├──────────────────────────→  │
  │                                │  SELECT * FROM user_accounts │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Generate NEW tokens         │
  │                                │                               │
  │                                ├─ Revoke old refresh token    │
  │                                ├──────────────────────────→  │
  │                                │  UPDATE refresh_tokens       │
  │                                │  SET revoked_at = NOW        │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Store new refresh token     │
  │                                ├──────────────────────────→  │
  │                                │  INSERT INTO refresh_tokens  │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │  ← ─ AuthResponse ────────────│                               │
  │   {newTokens, user}           │                               │
```

### Password Reset Flow

```
Client                          Server                         Database
  │                              │                               │
  │ Step 1: Forgot Password       │                               │
  ├─ POST /api/auth/forgot-pw ──→                                │
  │  {email}                       │                               │
  │                                ├─ Find user by email          │
  │                                ├──────────────────────────→  │
  │                                │  SELECT * FROM user_accounts │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Generate reset token        │
  │                                │  48-byte random              │
  │                                │                               │
  │                                ├─ Hash token (SHA-256)        │
  │                                │                               │
  │                                ├─ Store in DB with 30-min TTL│
  │                                ├──────────────────────────→  │
  │                                │  INSERT INTO password_reset_ │
  │                                │  tokens WITH expires_at      │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │  ← ─ {message, reset_token} ──│  (Email sent async)          │
  │                                │                               │
  │ [Client receives email/link]   │                               │
  │                                │                               │
  │ Step 2: Reset Password         │                               │
  ├─ POST /api/auth/reset-pw ────→                                │
  │  {resetToken, newPassword}     │                               │
  │                                ├─ Hash provided token         │
  │                                │  SHA-256(resetToken)         │
  │                                │                               │
  │                                ├─ Find token in DB            │
  │                                ├──────────────────────────→  │
  │                                │  SELECT * FROM password_reset│
  │                                │  WHERE token_hash = ?        │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Validate token              │
  │                                │  ✓ Exists                    │
  │                                │  ✓ Not used yet              │
  │                                │  ✓ Not expired               │
  │                                │                               │
  │                                ├─ Load user                   │
  │                                ├──────────────────────────→  │
  │                                │  SELECT * FROM user_accounts │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │                                ├─ Hash new password           │
  │                                │                               │
  │                                ├─ Update password + mark used │
  │                                ├──────────────────────────→  │
  │                                │  UPDATE user_accounts        │
  │                                │  UPDATE password_reset_      │
  │                                │  tokens SET used_at = NOW    │
  │                                │←──────────────────────── ✓  │
  │                                │                               │
  │  ← ─ {message: "Success"} ────│                               │
```

---

## Configuration

### Application Properties

Located in `src/main/resources/application.yml`:

```yaml
server:
  port: ${SERVER_PORT:8081}

spring:
  application:
    name: user-service
  
  # Database Configuration
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: validate  # Don't auto-create schema
    open-in-view: false   # Disable lazy loading outside transactions
  
  flyway:
    enabled: true         # Use Flyway migrations

# JWT Configuration (from environment or config server)
security:
  jwt:
    issuer: ${JWT_ISSUER:volunteer-user-service}
    secret: ${JWT_SECRET:}
    expires-in: ${JWT_EXPIRES_IN:3600}           # 1 hour
    refresh-expires-in: ${JWT_REFRESH_EXPIRES_IN:604800}  # 7 days
```

### Environment Variables Required

```bash
# Server
SERVER_PORT=8081

# Database
DB_URL=jdbc:postgresql://localhost:5432/volunteer_user_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-min-32-characters-recommended
JWT_ISSUER=volunteer-user-service
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800
```

### Config Server Integration

User Service fetches configuration from Config Server:

```yaml
spring:
  config:
    import: "configserver:http://localhost:8888,optional:file:.env[.properties]"
  cloud:
    config:
      fail-fast: true
```

---

## Error Handling

### Exception Hierarchy

All exceptions are caught by `ApiExceptionHandler` (@RestControllerAdvice):

```
Exception
├─ MethodArgumentNotValidException
│  └─ Returns: 400 Bad Request
│     {error: "Validation failed", fields: {...}}
│
├─ AuthenticationException
│  └─ Returns: 401 Unauthorized
│
├─ AccessDeniedException
│  └─ Returns: 403 Forbidden
│
├─ JwtException
│  └─ Returns: 401 Unauthorized
│
├─ IllegalArgumentException
│  └─ Returns: 400 Bad Request
│
└─ Exception (generic)
   └─ Returns: 500 Internal Server Error
```

### Example Error Responses

**Validation Error:**
```json
{
  "error": "Validation failed.",
  "fields": {
    "email": "must be a valid email address",
    "password": "size must be between 8 and 256"
  }
}
```

**Authentication Error:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

**General Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Key Design Decisions

### Why Separate Tokens?

**Access Token (short-lived, 1 hour)**
- Reduces security window if token leaked
- Client needs new token frequently (refresh endpoint)
- Server doesn't need to check DB for every request

**Refresh Token (long-lived, 7 days)**
- Stored in database (hashed) for revocation capability
- Client keeps in secure storage
- Used only to obtain new access tokens
- Can be invalidated on logout/password change

### Why Hash Tokens?

If database is compromised:
- Attacker gets hashed tokens, not raw tokens
- Raw tokens still in client's secure storage
- Tokens are useless without matching raw versions

### Why JWT (Stateless)?

vs. Session-based (database lookups):
- No database query per request (faster)
- Scales horizontally (no session replication)
- Microservice-friendly (each service validates independently)
- Token expires even without logout

### Why BCrypt for Passwords?

vs. Plain text or simple hash:
- Adaptive work factor (gets stronger as hardware improves)
- Automatic salting (no password reuse attacks)
- Slow hashing (prevents brute force)

---

## Best Practices Used

✅ **Security**
- Passwords hashed with BCrypt
- Tokens not logged
- Refresh token hashing
- Token revocation tracking
- No hardcoded secrets

✅ **Performance**
- Database indexes on frequently queried fields
- Connection pooling (HikariCP default)
- Stateless design (no session storage)

✅ **Reliability**
- Transaction management (@Transactional)
- Proper exception handling
- Input validation
- Cascading deletes (FK constraints)

✅ **Maintainability**
- Proper layering (5 layers)
- Dependency injection
- Clear naming conventions
- Comprehensive DTOs

✅ **Scalability**
- Microservice-ready
- Stateless design
- Database indices
- Configurable settings

---

## Testing Recommendations

### Unit Tests
- UserAccountService methods (register, update, etc.)
- AuthTokenService token operations
- Password hashing verification

### Integration Tests
- End-to-end API flows (register → login → refresh)
- Database transactions
- Error handling

### Security Tests
- JWT token validation
- Password reset token expiry
- Token revocation

### Load Tests
- Concurrent registrations
- Token refresh performance
- Database connection pooling

---

## Monitoring & Debugging

### Health Endpoint
```
GET http://localhost:8081/actuator/health
```

### Debug SQL Queries
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

### JWT Decoding (DEBUG)
```java
// Decode JWT for inspection
// Use jwt.io or similar tools
```

---

## Deployment Checklist

- [ ] Set environment variables (DB_URL, JWT_SECRET, etc.)
- [ ] Create PostgreSQL databases (user_db, event_db, notification_db)
- [ ] Run Flyway migrations
- [ ] Configure Config Server
- [ ] Test registration flow
- [ ] Test login & token refresh
- [ ] Test password reset
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting

---

## Summary

The User Service is a production-ready microservice that handles:
- **Authentication:** Registration, login, token management
- **User Management:** Profiles, role assignment, password changes
- **Security:** JWT tokens, BCrypt passwords, token hashing
- **Data Persistence:** PostgreSQL with proper schema design

It follows Spring best practices with proper layering, dependency injection, and transaction management, making it maintainable and scalable.

---

*Last Updated: March 2, 2026*
