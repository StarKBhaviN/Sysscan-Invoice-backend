## SysscanInvoice API Reference

This document lists all API endpoints, required roles, authentication, and sample cURL commands you can run to test the backend.

### Base URL

- Local development: `http://localhost:3000`

### Authentication

- JWT Bearer tokens are required for protected routes.
- Obtain a token via `POST /users/login`.
- Send the token using header: `Authorization: Bearer <JWT>`

### Roles

- Roles: `OWNER`, `ADMIN`, `USER`
- Admins can add up to 4 sub-users (in addition to themselves) if their subscription is active.
- Owners have elevated privileges (e.g., list all users, delete any non-admin user).

---

## Users

### POST /users/signup

Create a user account.

Request body:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "S3curePass!",
  "phoneNumber": "+1234567890"
}
```

Sample cURL:

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"S3curePass!","phoneNumber":"+1234567890"}'
```

### POST /users/login

Login and receive a JWT token.

Request body:

```json
{
  "email": "alice@example.com",
  "password": "S3curePass!"
}
```

Sample cURL:

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"S3curePass!"}'
```

### GET /users/profile

Get current authenticated user profile. Role: `USER` (any authenticated user).

Sample cURL:

```bash
curl http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwiaWQiOjIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzU1NTAwMDU5LCJleHAiOjE3NTU1ODY0NTl9.ZJxsA_DjVRCtTxb7o8KOkw6bkIwjLuf7KgQlEC0oKY4"
```

### GET /users

List users.

- Role: `OWNER` → lists all users.
- Role: `ADMIN` → lists sub-users linked to this admin.

Sample cURL:

```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer <JWT>"
```

### POST /users/add

Admin adds a sub-user (max 4). Requires active subscription on the admin.

Request body:

```json
{
  "username": "bob",
  "email": "bob@example.com",
  "password": "S3curePass!",
  "phoneNumber": "+1987654321"
}
```

Sample cURL:

```bash
curl -X POST http://localhost:3000/users/add \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@example.com","password":"S3curePass!","phoneNumber":"+1987654321"}'
```

curl -X POST http://localhost:3000/users/add \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwiaWQiOjIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1NTUwMTE3MywiZXhwIjoxNzU1NTg3NTczfQ.ocFAMNjIINR3Ri_PSMC9WGBEwgA9QLgTkJaqHgkkx5Y" \
 -H "Content-Type: application/json" \
 -d '{"username":"bob user1","email":"user1@example.com","password":"Bhavin@123","phoneNumber":"+1987654321"}'

### DELETE /users/:id

Delete a user.

- Role: `ADMIN` → delete own sub-user by ID.
- Role: `OWNER` → delete any non-admin user by ID.

Sample cURL:

```bash
curl -X DELETE http://localhost:3000/users/123 \
  -H "Authorization: Bearer <JWT>"
```

### POST /users/photo

Upload a profile photo for the current user. Multipart form-data with field name `photo`.

Sample cURL:

```bash
curl -X POST http://localhost:3000/users/photo \
  -H "Authorization: Bearer <JWT>" \
  -F "photo=@/path/to/photo.jpg"
```

```bash
curl -X POST http://localhost:3000/users/refresh-token \
  -H "Authorization: Bearer <JWT>"
```

---

## Payment

### GET /payment

List all payments.

```bash
curl http://localhost:3000/payment
```

### GET /payment/:userID

List all payments for a specific user ID.

```bash
curl http://localhost:3000/payment/1
```

### POST /payment

Create a payment record (raw create; typically used by system or tests).

Request body:

```json
{
  "amount": 999.0,
  "status": "succeeded",
  "date": "2025-07-06T00:00:00.000Z",
  "subscriptionID": 1,
  "userID": 1
}
```

```bash
curl -X POST http://localhost:3000/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":999.0,"status":"succeeded","date":"2025-07-06T00:00:00.000Z","subscriptionID":1,"userID":1}'
```

### POST /payment/checkout

Create a mock checkout session for the authenticated user.

Request body:

```json
{ "amount": 999.0, "provider": "mock" }
```

```bash
curl -X POST http://localhost:3000/payment/checkout \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"amount":999.0,"provider":"mock"}'
```

### POST /payment/webhook

Mock webhook to activate subscription upon payment success. In production, this would be called by your payment provider.

Request body:

```json
{
  "event": "payment.succeeded",
  "data": { "userId": 1, "amount": 999.0, "status": "succeeded" }
}
```

```bash
curl -X POST http://localhost:3000/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.succeeded","data":{"userId":1,"amount":999.0,"status":"succeeded"}}'
```

Response contains `rolePromoted: true` when the user has been upgraded to ADMIN.

---

## Subscription

### GET /subscription

List all subscriptions.

```bash
curl http://localhost:3000/subscription
```

### GET /subscription/:userID

Get a user subscription by user ID.

```bash
curl http://localhost:3000/subscription/1
```

### POST /subscription

Create a subscription (usually created via webhook; available for testing).

Request body:

```json
{
  "startDate": "2025-07-06T00:00:00.000Z",
  "endDate": "2025-08-06T00:00:00.000Z",
  "isActive": true,
  "paymentMethod": "mock",
  "userID": 1
}
```

```bash
curl -X POST http://localhost:3000/subscription \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2025-07-06T00:00:00.000Z","endDate":"2025-08-06T00:00:00.000Z","isActive":true,"paymentMethod":"mock","userID":1}'
```

---

## Companies

### GET /companies

List all companies (database-backed).

```bash
curl http://localhost:3000/companies
```

### GET /companies/me

List companies for the authenticated user. If a local SQLite file has been synced for the user, it will be used; otherwise falls back to database.

```bash
curl http://localhost:3000/companies/me \
  -H "Authorization: Bearer <JWT>"
```

### POST /companies

Create a company record.

Request body example:

```json
{
  "name": "Acme Corp",
  "address": "123 Main St",
  "userID": 1,
  "invoices": {},
  "sales": {},
  "purchases": {},
  "receivables": {},
  "payables": {}
}
```

```bash
curl -X POST http://localhost:3000/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","address":"123 Main St","userID":1,"invoices":{},"sales":{},"purchases":{},"receivables":{},"payables":{}}'
```

---

## SQLite Sync (Per-User)

### POST /sqlite/register

Register a remote SQLite database file URL for the current user.

Request body:

```json
{ "provider": "url", "url": "https://example.com/path/to/company.db" }
```

```bash
curl -X POST http://localhost:3000/sqlite/register \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"provider":"url","url":"https://example.com/path/to/company.db"}'
```

### POST /sqlite/sync

Download the registered SQLite file to local storage for the current user.

```bash
curl -X POST http://localhost:3000/sqlite/sync \
  -H "Authorization: Bearer <JWT>"
```

### GET /sqlite/meta

Get the registered SQLite file metadata for the current user.

```bash
curl http://localhost:3000/sqlite/meta \
  -H "Authorization: Bearer <JWT>"
```

---

## Pairing (Desktop .NET App + Mobile App)

### POST /pairing/create

Create a short-lived pairing code for the authenticated user. Share this code with the desktop app to pair.

```bash
curl -X POST http://localhost:3000/pairing/create \
  -H "Authorization: Bearer <JWT>"
```

### POST /pairing/activate

Activate a pairing using a code and a `desktopClientId`.

Request body:

```json
{ "code": "AB12CD", "desktopClientId": "DESKTOP-12345" }
```

```bash
curl -X POST http://localhost:3000/pairing/activate \
  -H "Content-Type: application/json" \
  -d '{"code":"AB12CD","desktopClientId":"DESKTOP-12345"}'
```

### GET /pairing

List pairings associated with the authenticated user.

```bash
curl http://localhost:3000/pairing \
  -H "Authorization: Bearer <JWT>"
```

---

## Testing Flow (Quick Start)

1. Sign up or log in to obtain a JWT.
   - POST `/users/signup` (optional)
   - POST `/users/login` → save `accessToken` as `<JWT>`
2. Activate subscription and promote to ADMIN:
   - POST `/payment/checkout` with `<JWT>`
   - POST `/payment/webhook` with `{ event: 'payment.succeeded', data: { userId, amount, status: 'succeeded' } }`
   - POST `/users/refresh-token` with `<JWT>` to get a fresh token reflecting updated role `ADMIN`.
3. As ADMIN, add up to 4 sub-users via `POST /users/add` using the refreshed `<JWT>`.
4. As any USER, register a remote SQLite DB via `POST /sqlite/register`, then download via `POST /sqlite/sync`.
5. Verify company data via `GET /companies/me` (uses local SQLite if synced; DB fallback otherwise).
6. Create pairing code using `POST /pairing/create` and activate from desktop using `POST /pairing/activate`.

Notes:

- Replace `<JWT>` with the token returned by `POST /users/login`.
- Replace IDs and paths in sample cURL with real values.
