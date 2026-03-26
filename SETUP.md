# Portiva — Complete Setup & Route Testing Guide

> Spring Boot 3 · React 19 · PostgreSQL 16 · Redis 7 · Docker Compose

---

## Table of Contents

1. [Quick Start — Docker (Recommended)](#1-quick-start--docker-recommended)
2. [Direct / Local Setup (No Docker)](#2-direct--local-setup-no-docker)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Gmail App Password Setup](#4-gmail-app-password-setup)
5. [Production Checklist](#5-production-checklist)
6. [Postman Route Testing — All 34 Endpoints](#6-postman-route-testing--all-34-endpoints)

---

## 1. Quick Start — Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**
- Git (to clone the repo)

### Steps

```bash
# 1. Clone
git clone <your-repo-url>
cd FinalProject

# 2. Copy and fill env file
copy .env.example .env       # Windows
# cp .env.example .env       # Mac / Linux

# 3. Edit .env — see Section 3 for what to fill
notepad .env                 # Windows
# nano .env                  # Mac / Linux

# 4. Start everything
docker compose up --build -d

# 5. Verify all 4 containers are running
docker ps
```

Expected containers:
| Container | Port | Health |
|---|---|---|
| `portiva_postgres` | 5432 (internal) | healthy |
| `portiva_redis` | 6379 (internal) | healthy |
| `portiva_backend` | 5000 | healthy |
| `portiva_frontend` | 80 | - |

### Check backend started
```bash
docker logs portiva_backend --tail 30
# Should see: Started PortivaApplication in x.xxx seconds
```

### Useful commands
```bash
# View logs live
docker logs portiva_backend -f
docker logs portiva_postgres -f

# Restart backend only (after code change + rebuild)
docker compose up --build backend -d

# Stop everything
docker compose down

# Stop + wipe database (clean slate)
docker compose down -v
```

---

## 2. Direct / Local Setup (No Docker)

Use this if you want to run the backend in IntelliJ/IDE for hot-reload debugging.

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL 16 running locally
- Redis 7 running locally (or disable Redis with in-memory fallback)
- Node.js 20+ (for frontend)

### Backend Setup

```bash
cd backend

# 1. Create PostgreSQL database
psql -U postgres
CREATE DATABASE portiva;
CREATE USER portiva WITH PASSWORD 'portiva_dev_password';
GRANT ALL PRIVILEGES ON DATABASE portiva TO portiva;
\q

# 2. Set local env vars (PowerShell)
$env:SPRING_DATASOURCE_URL     = "jdbc:postgresql://localhost:5432/portiva"
$env:SPRING_DATASOURCE_USERNAME= "portiva"
$env:SPRING_DATASOURCE_PASSWORD= "portiva_dev_password"
$env:SPRING_DATA_REDIS_HOST    = "localhost"
$env:SPRING_DATA_REDIS_PORT    = "6379"
$env:SPRING_DATA_REDIS_PASSWORD= ""
$env:JWT_SECRET                = "cG9ydGl2YS1zdXBlci1zZWNyZXQta2V5LTI1Ni1iaXQtbG9uZy1zdHJpbmctaGVyZQ=="
$env:MAIL_USERNAME             = "your@gmail.com"
$env:MAIL_PASSWORD             = "your_app_password"
$env:RAZORPAY_KEY_ID           = "rzp_test_xxxxxxxxxxxxxxxx"
$env:RAZORPAY_KEY_SECRET       = "your_key_secret"
$env:RAZORPAY_WEBHOOK_SECRET   = "any_local_secret"
$env:AI_ENGINE_URL             = "http://localhost:8000"
$env:APP_BASE_URL              = "http://localhost:5000"
$env:FRONTEND_URL              = "http://localhost:5173"

# 3. Run
mvn spring-boot:run
# Backend starts at http://localhost:5000/api
```

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# 3. Run dev server
npm run dev
# Frontend at http://localhost:5173
```

### Disable Redis (if not installed locally)
Add to `application.properties` for local dev without Redis:
```properties
spring.cache.type=simple
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
```

---

## 3. Environment Variables Reference

Edit `.env` at project root. All variables listed below.

| Variable | Example | Required | Description |
|---|---|---|---|
| `DB_PASSWORD` | `portiva123` | Yes | PostgreSQL password — you make this up |
| `REDIS_PASSWORD` | `redis123` | Yes | Redis password — you make this up |
| `JWT_SECRET` | *(base64 string)* | Yes | Signs JWT tokens — **change in production** |
| `MAIL_USERNAME` | `you@gmail.com` | Yes | Gmail address for sending OTPs |
| `MAIL_PASSWORD` | `abcd efgh ijkl mnop` | Yes | Gmail **App Password** (16 chars, no spaces) |
| `RAZORPAY_KEY_ID` | `rzp_test_xxx` | Yes | From Razorpay dashboard → API Keys |
| `RAZORPAY_KEY_SECRET` | `your_secret` | Yes | From Razorpay dashboard → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | `any_string_local` | Yes | Set in Razorpay dashboard webhook settings |
| `AI_ENGINE_URL` | `http://ai-engine:8000` | No | AI server URL (left as-is for Docker) |

### Minimum .env for first run (no payments):

```env
DB_PASSWORD=portiva123
REDIS_PASSWORD=redis123
JWT_SECRET=cG9ydGl2YS1zdXBlci1zZWNyZXQta2V5LTI1Ni1iaXQtbG9uZy1zdHJpbmctaGVyZQ==
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=yourapppassword
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder
RAZORPAY_WEBHOOK_SECRET=localtest
AI_ENGINE_URL=http://ai-engine:8000
```

---

## 4. Gmail App Password Setup

> Required for OTP emails to actually send. Uses Gmail SMTP.

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (mandatory)
3. Go to **Security → 2-Step Verification → App passwords** (scroll to bottom)
4. Click **Create app password**
5. Name it `Portiva` → click **Create**
6. Copy the **16-character password** shown (no spaces)
7. Paste into `.env`:
   ```
   MAIL_USERNAME=your@gmail.com
   MAIL_PASSWORD=abcdefghijklmnop
   ```

> ⚠️ Use the App Password (16 chars), **NOT** your regular Gmail password.

---

## 5. Production Checklist

Replace these values before going live:

| What | Dev Default | Production Action |
|---|---|---|
| `DB_PASSWORD` | `portiva123` | Use strong random password |
| `REDIS_PASSWORD` | `redis123` | Use strong random password |
| `JWT_SECRET` | *(default base64)* | Generate: `openssl rand -base64 64` |
| `MAIL_PASSWORD` | Gmail app password | Keep Gmail App Password or use SendGrid/Mailgun |
| `RAZORPAY_KEY_ID` | `rzp_test_xxx` | Switch to live keys from Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | test secret | Switch to live secret |
| `RAZORPAY_WEBHOOK_SECRET` | local string | Set from Razorpay → Webhooks → secret |
| `AI_ENGINE_URL` | `http://ai-engine:8000` | Your deployed AI server URL |
| `APP_BASE_URL` | `http://localhost` | `https://api.yourdomain.com` |
| `FRONTEND_URL` | `http://localhost` | `https://yourdomain.com` |
| `spring.jpa.show-sql` | `true` | Set to `false` |
| `spring.jpa.hibernate.ddl-auto` | `update` | Change to `validate` (use migrations) |

---

## 6. Postman Route Testing — All 34 Endpoints

### Setup in Postman

1. Create a **Collection** named `Portiva API`
2. Set **Collection Variable**:
   - `baseUrl` = `http://localhost:5000/api`
3. Set **Authorization** on Collection:
   - Type: `Bearer Token`
   - Token: `{{token}}` (set after login)

---

### GROUP 1 — Auth (no token required)

#### 1. Register
```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "name": "Kalpesh Ghodekar",
  "email": "your@gmail.com",
  "password": "Test@1234"
}
```
Expected: `200 { "message": "OTP sent to your email" }`
After this: **Check your Gmail inbox** for the OTP email.

---

#### 2. Verify OTP (activates account + returns JWT)
```
POST {{baseUrl}}/auth/verify-otp
Content-Type: application/json

{
  "email": "your@gmail.com",
  "otp": "123456"
}
```
Expected: `200 { "token": "eyJ...", "user": { ... } }`
**Copy the token** → paste into Collection → Variables → `token`.

---

#### 3. Resend OTP
```
POST {{baseUrl}}/auth/resend-otp
Content-Type: application/json

{
  "email": "your@gmail.com"
}
```
Expected: `200 { "message": "OTP resent to your email" }`

---

#### 4. Login
```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "your@gmail.com",
  "password": "Test@1234"
}
```
Expected: `200 { "token": "eyJ...", "user": { ... } }`

---

#### 5. Logout
```
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{token}}
```
Expected: `200 { "message": "Logged out successfully" }`

---

#### 6. Get Current User (me)
```
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```
Expected: `200 { "id": "...", "name": "...", "email": "...", ... }`

---

### GROUP 2 — User Profile (token required)

#### 7. Get Profile
```
GET {{baseUrl}}/user/profile
Authorization: Bearer {{token}}
```

---

#### 8. Update Profile
```
PUT {{baseUrl}}/user/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Kalpesh Ghodekar",
  "title": "Full Stack Developer",
  "location": "Mumbai, India",
  "website": "https://kalpesh.dev"
}
```

---

#### 9. Update Password
```
PUT {{baseUrl}}/user/password
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "currentPassword": "Test@1234",
  "newPassword": "NewPass@5678"
}
```

---

#### 10. Delete Account (soft delete)
```
DELETE {{baseUrl}}/user/account
Authorization: Bearer {{token}}
```
> ⚠️ This soft-deletes the account. Create a fresh account to continue testing.

---

### GROUP 3 — Portfolio (token required)

#### 11. Generate Portfolio (triggers async AI)
```
POST {{baseUrl}}/portfolio/generate
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "formData": {
    "name": "Kalpesh Ghodekar",
    "title": "Full Stack Developer",
    "email": "your@gmail.com",
    "phone": "+91 98765 43210",
    "location": "Mumbai, India",
    "about": "Passionate developer with 3 years of experience building scalable web applications.",
    "skills": ["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
    "experience": [
      {
        "company": "Tech Corp",
        "role": "Software Engineer",
        "from": "2022-01",
        "to": "present",
        "description": "Built microservices using Spring Boot"
      }
    ],
    "education": [
      {
        "institution": "Mumbai University",
        "degree": "B.E. Computer Engineering",
        "year": "2022"
      }
    ],
    "projects": [
      {
        "name": "Portiva",
        "description": "AI-powered portfolio builder",
        "tech": ["React", "Spring Boot"],
        "url": "https://github.com/kalpesh/portiva"
      }
    ],
    "templateName": "minimal_single"
  }
}
```
Expected: `200 { "portfolioId": "...", "liveUrl": "...", "templateName": "minimal_single" }`

> **Note:** AI runs async. Portfolio `ready = false` immediately — polls until true.

---

#### 12. Get My Portfolio
```
GET {{baseUrl}}/portfolio/me
Authorization: Bearer {{token}}
```
Save the `id` from response as `portfolioId` collection variable.

---

#### 13. Update Portfolio
```
PUT {{baseUrl}}/portfolio/{{portfolioId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "placeholder_map": {
    "name": "Kalpesh Ghodekar",
    "title": "Senior Full Stack Developer"
  }
}
```

---

#### 14. Change Template
```
PATCH {{baseUrl}}/portfolio/{{portfolioId}}/template
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "templateName": "minimal_single"
}
```

---

#### 15. Get Analytics
```
GET {{baseUrl}}/portfolio/{{portfolioId}}/analytics
Authorization: Bearer {{token}}
```

---

#### 16. Delete Portfolio (soft delete)
```
DELETE {{baseUrl}}/portfolio/{{portfolioId}}
Authorization: Bearer {{token}}
```

---

### GROUP 4 — Public Portfolio (no token)

#### 17. Get Public Portfolio by Slug
```
GET {{baseUrl}}/portfolio/public/kalpesh-ghodekar
```
Expected: `200 { "ready": true/false, "components": {...}, "placeholder_map": {...} }`

---

#### 18. Get Portfolio by Custom Domain
```
GET {{baseUrl}}/portfolio/by-domain?domain=kalpesh.dev
```

---

### GROUP 5 — Templates (no token)

#### 19. Get All Templates
```
GET {{baseUrl}}/templates
```
Expected: `200 [ { "id": "minimal_single", "name": "...", "category": "...", ... } ]`

---

#### 20. Get Template by ID
```
GET {{baseUrl}}/templates/minimal_single
```

---

### GROUP 6 — Subscription (mixed auth)

#### 21. Get Subscription Status (token required)
```
GET {{baseUrl}}/subscription/status
Authorization: Bearer {{token}}
```
Expected: `200 { "plan": "free", "status": "active", "expiresAt": null, ... }`

---

#### 22. Get Plans (public)
```
GET   
```
Expected: `200 { "plans": [ { "id": "free", "price": 0, ... }, ... ] }`

---

#### 23. Cancel Subscription (token required)
```
POST {{baseUrl}}/subscription/cancel
Authorization: Bearer {{token}}
```

---

### GROUP 7 — Payments (token required, Razorpay test keys needed)

#### 24. Create Order
```
POST {{baseUrl}}/payment/create-order
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "plan": "pro",
  "billingPeriod": "monthly"
}
```
Expected: `200 { "orderId": "order_xxx", "amount": 99900, "currency": "INR", "keyId": "rzp_test_xxx" }`

> Requires valid `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in `.env`.

---

#### 25. Verify Payment
```
POST {{baseUrl}}/payment/verify
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_from_razorpay"
}
```
Expected: `200 { "success": true, "subscription": { "plan": "pro", "status": "active" } }`

---

### GROUP 8 — Webhooks (no token, Razorpay only)

#### 26. Razorpay Webhook (simulated)
```
POST {{baseUrl}}/webhooks/razorpay
Content-Type: application/json
X-Razorpay-Signature: <hmac_sha256_of_body>
X-Razorpay-Event-Id: evt_test_001

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "order_id": "order_xxx",
        "id": "pay_xxx",
        "amount": 99900,
        "status": "captured"
      }
    }
  }
}
```
Expected: `200 { "status": "received" }`

---

### GROUP 9 — Admin (Admin JWT required)

> Create an admin account: Manually set `role = 'ADMIN'` in the `users` table via `psql` or pgAdmin.
> Then login normally to get an admin token.

```sql
-- In psql (Docker):
docker exec -it portiva_postgres psql -U portiva -d portiva
UPDATE users SET role = 'ADMIN' WHERE email = 'your@gmail.com';
```

#### 27. Get Users (paginated)
```
GET {{baseUrl}}/admin/users?page=0&size=10&search=kalpesh
Authorization: Bearer {{adminToken}}
```

---

#### 28. Get User Detail
```
GET {{baseUrl}}/admin/users/{{userId}}
Authorization: Bearer {{adminToken}}
```

---

#### 29. Delete User (admin)
```
DELETE {{baseUrl}}/admin/users/{{userId}}
Authorization: Bearer {{adminToken}}
```

---

#### 30. Get All Portfolios
```
GET {{baseUrl}}/admin/portfolios?page=0&size=10
Authorization: Bearer {{adminToken}}
```

---

#### 31. Get Platform Stats
```
GET {{baseUrl}}/admin/stats
Authorization: Bearer {{adminToken}}
```
Expected: `200 { "totalUsers": 5, "active30d": 3, "planBreakdown": {...}, "revenue": 1998 }`

---

#### 32. Create Template
```
POST {{baseUrl}}/admin/templates
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "id": "dark_single",
  "name": "Dark Single Page",
  "category": "single",
  "requiredPlan": "free",
  "previewUrl": "https://portiva.com/previews/dark_single.png",
  "isActive": true,
  "sortOrder": 2
}
```

---

#### 33. Update Template
```
PUT {{baseUrl}}/admin/templates/dark_single
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "name": "Dark Single Page v2",
  "requiredPlan": "pro"
}
```

---

#### 34. Delete Template
```
DELETE {{baseUrl}}/admin/templates/dark_single
Authorization: Bearer {{adminToken}}
```

---

## Health Check

```
GET {{baseUrl}}/actuator/health
```
Expected:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "redis": { "status": "UP" }
  }
}
```

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Missing or expired JWT | Login again, update `{{token}}` |
| `403 Forbidden` | Email not verified | Complete OTP verification first |
| `404 Not Found` | Wrong ID / slug | Check the ID in response from step 12 |
| `429 Too Many Requests` | Rate limit hit | Wait (see `Retry-After` header) |
| `500` on register | Gmail SMTP failure | Check `.env` MAIL_USERNAME / MAIL_PASSWORD, ensure App Password is set |
| `500` on generate | AI engine not running | Expected if no AI server — portfolio stays `ready: false` |

---

## Testing OTP Email

1. Run `POST /auth/register` with a **real Gmail address you can check**
2. Check inbox for email from your `MAIL_USERNAME`
3. Subject: **"Your Portiva verification code"**
4. Copy the 6-digit code → run `POST /auth/verify-otp`
5. After verify: check inbox again for **Welcome to Portiva** email

> If no email arrives: run `docker logs portiva_backend | grep -i mail` to see SMTP errors.
