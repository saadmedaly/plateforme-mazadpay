# MazadPay — Phase 2: Backend & Marketplace Planning

> وثيقة تخطيط معماري — لا تعديل على الموقع الحالي في هذه المرحلة.
> الموقع التعريفي يبقى كما هو على Cloudflare Pages.

---

## أولاً — الهدف من Phase 2

تحويل MazadPay من موقع تعريفي ثابت إلى منصة مزادات رقمية حقيقية تشمل:

- Backend API احترافي مستضاف على Render
- قاعدة بيانات PostgreSQL على Neon
- تخزين وسائط دائم على Cloudflare R2
- نظام مزايدات حقيقي مع wallet داخلي
- إدارة إعلانات مع مراجعة إدارية
- نظام مصادقة آمن

**الدومينات المستهدفة:**

| الدومين | الغرض |
|---------|--------|
| `https://mazadpay.com` | الموقع التعريفي — Cloudflare Pages (موجود) |
| `https://api.mazadpay.com` | Backend API — Render |
| `https://admin.mazadpay.com` | لوحة الإدارة — لاحقاً |

---

## ثانياً — Stack المقترح

### Backend: Go

**Router: Fiber** ✅ (التوصية)

| المعيار | Fiber | Gin |
|---------|-------|-----|
| الأداء | ممتاز (بني على fasthttp) | ممتاز |
| API متشابه مع Express | نعم — سهل التعلم | لا |
| Middleware ecosystem | واسع | واسع |
| معالجة الأخطاء | واضحة وبسيطة | جيدة |
| Context API | أبسط | يحتاج type assertions |

Fiber هو الاختيار الأمثل لسرعة التطوير مع أداء ممتاز.

### SQL Layer: sqlc ✅ (التوصية)

| المعيار | sqlc | GORM | pgx raw |
|---------|------|------|---------|
| Type safety | 100% — كود مولّد | لا | يدوي |
| SQL control | كامل | محدود | كامل |
| Performance | ممتاز | overhead | ممتاز |
| Migration friendly | نعم | نعم | نعم |
| Learning curve | سهل | سهل | متوسط |

sqlc يولّد كوداً Go type-safe من SQL مكتوب يدوياً — أفضل من GORM للمشاريع الجادة.

### الملخص النهائي

```
Language:   Go 1.22+
Router:     Fiber v2
Database:   PostgreSQL 16 on Neon
SQL Layer:  sqlc + pgx/v5
Auth:       JWT (access + refresh tokens)
Storage:    Cloudflare R2
Hosting:    Render Web Service
Migrations: golang-migrate
```

---

## ثالثاً — الموديولات الأساسية

### المرحلة الأولى (Core)
- `users` — تسجيل، تسجيل دخول، إدارة الحساب
- `auth` — JWT، refresh tokens، logout
- `categories` — تصنيفات المزادات
- `auctions` — إنشاء، تعديل، حذف، قائمة
- `auction_images` — رفع صور المنتجات
- `bids` — نظام المزايدة
- `contact_messages` — نموذج التواصل

### المرحلة الثانية (Extended)
- `favorites` — المزادات المفضّلة
- `admin` — إدارة المستخدمين والإعلانات
- `audit_logs` — سجل العمليات الإدارية

### المرحلة الثالثة (Future)
- `wallet` — المحفظة الداخلية والشحن
- `notifications` — إشعارات المزايدات
- `payments` — الدفع والاسترداد
- `delivery` — خدمات التوصيل

---

## رابعاً — Database Schema

### جدول `users`

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone       VARCHAR(20) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE,
    full_name   VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,         -- bcrypt hash
    avatar_url  TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active   BOOLEAN DEFAULT TRUE,
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
```

---

### جدول `admins`

```sql
CREATE TABLE admins (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,           -- bcrypt hash
    full_name  VARCHAR(255) NOT NULL,
    role       VARCHAR(50) DEFAULT 'admin',     -- admin | super_admin
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### جدول `categories`

```sql
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar     VARCHAR(100) NOT NULL,
    name_fr     VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    icon        TEXT,
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### جدول `auctions`

```sql
CREATE TABLE auctions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES categories(id),
    title_ar        VARCHAR(255) NOT NULL,
    title_fr        VARCHAR(255),
    description_ar  TEXT,
    description_fr  TEXT,
    starting_price  NUMERIC(12, 2) NOT NULL,
    current_price   NUMERIC(12, 2) NOT NULL,
    reserve_price   NUMERIC(12, 2),
    deposit_amount  NUMERIC(12, 2) DEFAULT 0.00,
    bid_increment   NUMERIC(12, 2) DEFAULT 100.00,
    status          VARCHAR(30) DEFAULT 'pending',
        -- pending | approved | active | ended | cancelled | rejected
    admin_note      TEXT,
    starts_at       TIMESTAMPTZ,
    ends_at         TIMESTAMPTZ,
    total_bids      INTEGER DEFAULT 0,
    view_count      INTEGER DEFAULT 0,
    winner_id       UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auctions_user_id     ON auctions(user_id);
CREATE INDEX idx_auctions_category_id ON auctions(category_id);
CREATE INDEX idx_auctions_status      ON auctions(status);
CREATE INDEX idx_auctions_ends_at     ON auctions(ends_at);
```

---

### جدول `auction_images`

```sql
CREATE TABLE auction_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id  UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,                -- R2 public URL
    key         TEXT NOT NULL,                -- R2 object key
    is_primary  BOOLEAN DEFAULT FALSE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auction_images_auction_id ON auction_images(auction_id);
```

---

### جدول `bids`

```sql
CREATE TABLE bids (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id  UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id),
    amount      NUMERIC(12, 2) NOT NULL,
    is_winning  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_user_id    ON bids(user_id);
CREATE INDEX idx_bids_amount     ON bids(auction_id, amount DESC);
```

---

### جدول `favorites`

```sql
CREATE TABLE favorites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auction_id  UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, auction_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
```

---

### جدول `contact_messages`

```sql
CREATE TABLE contact_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name    VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255) NOT NULL,    -- email or phone
    message      TEXT NOT NULL,
    status       VARCHAR(30) DEFAULT 'unread',  -- unread | read | replied
    ip_address   INET,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
```

---

### جدول `audit_logs`

```sql
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID REFERENCES admins(id),
    action      VARCHAR(100) NOT NULL,
    entity      VARCHAR(100) NOT NULL,     -- auction | user | bid…
    entity_id   UUID,
    details     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin_id  ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity    ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created   ON audit_logs(created_at DESC);
```

---

## خامساً — API Routes

### Public (لا يحتاج مصادقة)

```
GET    /health
GET    /api/v1/categories
GET    /api/v1/auctions                   ?page=&limit=&category=&status=
GET    /api/v1/auctions/:id
GET    /api/v1/auctions/:id/bids
POST   /api/v1/contact
```

### Auth

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### User (يحتاج JWT)

```
GET    /api/v1/me
PUT    /api/v1/me
PUT    /api/v1/me/password
GET    /api/v1/me/auctions
GET    /api/v1/me/bids
GET    /api/v1/me/favorites
POST   /api/v1/me/favorites/:auction_id
DELETE /api/v1/me/favorites/:auction_id
```

### Auctions (يحتاج JWT)

```
POST   /api/v1/auctions
PUT    /api/v1/auctions/:id
DELETE /api/v1/auctions/:id
POST   /api/v1/auctions/:id/images
DELETE /api/v1/auctions/:id/images/:image_id
POST   /api/v1/auctions/:id/bids
```

### Admin (يحتاج Admin JWT)

```
POST   /api/v1/admin/auth/login

GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PUT    /api/v1/admin/users/:id/status

GET    /api/v1/admin/auctions
GET    /api/v1/admin/auctions/:id
PUT    /api/v1/admin/auctions/:id/status    -- approve | reject | cancel

GET    /api/v1/admin/contact-messages
PUT    /api/v1/admin/contact-messages/:id/status

GET    /api/v1/admin/audit-logs
```

---

## سادساً — Security Requirements

### Environment Variables — لا secrets في الكود

```
PORT, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
CORS_ALLOWED_ORIGINS, R2_*, APP_ENV
```

### CORS

```go
// مسموح فقط للدومينات المعتمدة — ممنوع استخدام "*"
AllowOrigins: "https://mazadpay.com,https://www.mazadpay.com,https://admin.mazadpay.com"
```

في بيئة التطوير فقط: `http://localhost:5500,http://localhost:3000`

### Authentication

- Access Token: JWT — صلاحية **15 دقيقة**
- Refresh Token: JWT — صلاحية **7 أيام** مخزّن في HTTP-only cookie
- Refresh Token Rotation: كل refresh يولّد token جديد ويبطل القديم
- Logout: يبطل الـ refresh token فوراً

### Password Hashing

**bcrypt** مع cost factor **12** (التوصية للإنتاج)

```go
hash, _ := bcrypt.GenerateFromPassword([]byte(password), 12)
```

### Rate Limiting

```
POST /auth/login      → 5 محاولات / دقيقة / IP
POST /auth/register   → 3 محاولات / 10 دقائق / IP
POST /auctions/:id/bids → 10 مزايدات / دقيقة / user
POST /contact         → 2 رسائل / 10 دقائق / IP
```

### Input Validation

- استخدام `go-playground/validator` لكل input
- تعقيم النصوص من HTML/SQL
- التحقق من أن المبلغ > current_price + bid_increment
- التحقق من صلاحية المزاد (status=active, ends_at > now)

### File Upload Validation

```
الأنواع المسموحة: image/jpeg, image/png, image/webp فقط
الحجم الأقصى: 5 MB للصورة الواحدة
العدد الأقصى: 8 صور للمزاد الواحد
فحص Magic Bytes (وليس الامتداد فقط)
تغيير اسم الملف إلى UUID عند الرفع
```

### SQL Injection Prevention

- sqlc يمنع SQL injection بشكل كامل (parameterized queries فقط)
- لا string concatenation في SQL

### Admin Protection

- Admin routes محمية بـ middleware منفصل
- Admin JWT مختلف عن User JWT (مفتاح سري مختلف)
- كل عملية إدارية تُسجَّل في `audit_logs`

### Secure Headers (Fiber middleware)

```go
app.Use(helmet.New()) // X-Frame-Options, nosniff, HSTS, etc.
```

### HTTPS Only

- Render يوفر HTTPS تلقائياً
- Cloudflare يوفر HTTPS لـ api.mazadpay.com
- رفض أي طلب HTTP في الإنتاج

---

## سابعاً — Environment Variables

ملف `.env.example` — لا تضع قيماً حقيقية هنا أبداً:

```env
# Server
PORT=8080
APP_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT
JWT_ACCESS_SECRET=change_me_to_long_random_string
JWT_REFRESH_SECRET=change_me_to_different_long_random_string
JWT_ACCESS_EXPIRES_MINUTES=15
JWT_REFRESH_EXPIRES_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=https://mazadpay.com,https://www.mazadpay.com,https://admin.mazadpay.com

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=mazadpay-media
R2_PUBLIC_URL=https://media.mazadpay.com

# Rate Limiting (requests per minute)
RATE_LIMIT_LOGIN=5
RATE_LIMIT_REGISTER=3

# Upload
MAX_IMAGE_SIZE_MB=5
MAX_IMAGES_PER_AUCTION=8
```

---

## ثامناً — Deployment على Render

### إعدادات Render Web Service

| الإعداد | القيمة |
|---------|--------|
| **Runtime** | Go |
| **Build Command** | `go build -o app ./cmd/server` |
| **Start Command** | `./app` |
| **Health Check Path** | `/health` |
| **Region** | Frankfurt (EU) أو Oregon (US) |
| **Plan** | Starter ($7/month) للبداية |

### Environment Variables على Render

أضف كل متغيرات `.env.example` من لوحة Render (ليس من ملف).

### ربط api.mazadpay.com

1. أضف Custom Domain في Render: `api.mazadpay.com`
2. أضف في Cloudflare DNS:

```
CNAME   api   <render-app>.onrender.com   Proxied ✅
```

### Health Check Endpoint

```go
app.Get("/health", func(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{
        "status":  "ok",
        "service": "mazadpay-api",
        "version": "1.0.0",
    })
})
```

### ربط CORS بالموقع

```go
app.Use(cors.New(cors.Config{
    AllowOrigins: os.Getenv("CORS_ALLOWED_ORIGINS"),
    AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
    AllowHeaders: "Origin,Content-Type,Authorization",
}))
```

### ربط Neon

```go
db, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
// sslmode=require مضمّن في DATABASE_URL من Neon
```

---

## تاسعاً — Neon PostgreSQL

### إنشاء المشروع

1. اذهب إلى [neon.tech](https://neon.tech)
2. أنشئ Project جديد: `mazadpay`
3. اختر Region: `eu-west-2` (London) أو `us-east-2`
4. احصل على Connection String من: **Dashboard → Connection Details**

### صيغة DATABASE_URL

```
postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

> `sslmode=require` **إلزامي** — Neon لا يقبل اتصالات غير مشفرة.

### Migrations

استخدام `golang-migrate`:

```bash
# تثبيت
go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# إنشاء migration جديد
migrate create -ext sql -dir db/migrations -seq create_users_table

# تطبيق migrations
migrate -database "$DATABASE_URL" -path db/migrations up

# التراجع
migrate -database "$DATABASE_URL" -path db/migrations down 1
```

### Branching (ميزة Neon المميزة)

```bash
# إنشاء branch للتطوير — منفصل عن production
neonctl branches create --name dev
neonctl branches create --name staging
```

### Backups

- Neon يوفر Point-in-Time Recovery تلقائياً
- احتفظ بـ migration files في Git كـ backup للـ schema

### ممنوع

- لا تستخدم SQLite في الإنتاج
- لا تضع DATABASE_URL في الكود
- لا تشغّل migrations يدوياً في الإنتاج بدون اختبار على staging أولاً

---

## عاشراً — Media Storage: Cloudflare R2

### لماذا لا نخزن الصور على Render Filesystem؟

Render يستخدم ephemeral filesystem — أي ملف تُرفعه **يُحذف** عند:
- كل redeploy
- كل restart تلقائي
- كل crash recovery

هذا يعني أن صور المستخدمين **ستضيع** بشكل دوري.

### الحل: Cloudflare R2 ✅ (التوصية)

**لماذا R2 على Cloudinary؟**

| المعيار | Cloudflare R2 | Cloudinary |
|---------|--------------|------------|
| السعر | مجاني حتى 10GB/شهر | مجاني حتى 25K تحويل |
| Egress fees | **صفر** (ميزة R2 الكبرى) | نعم |
| CDN | Cloudflare CDN مجاناً | CDN مدفوع |
| S3 compatible | نعم — SDK موحّد | لا |
| التكامل | مثالي مع Cloudflare ecosystem | يحتاج SDK منفصل |
| التحويلات التلقائية | لا (يحتاج Cloudflare Images) | نعم |

R2 هو الاختيار الأمثل لأن المشروع بالفعل على Cloudflare.

### إعداد R2

```bash
# إنشاء bucket
wrangler r2 bucket create mazadpay-media

# ربط custom domain (media.mazadpay.com)
# من Cloudflare Dashboard → R2 → mazadpay-media → Settings → Custom Domains
```

### تدفق رفع الصور

```
Client → API (Render) → validate image → upload to R2 → save URL in DB → return URL to client
```

---

## الحادي عشر — Admin Panel

### التوصية: React SPA على Cloudflare Pages

**لماذا React منفصل وليس مدمج في API؟**

- الفصل الواضح بين Frontend وBackend
- يمكن تحديث الـ Dashboard بدون لمس الـ API
- `admin.mazadpay.com` دومين منفصل — أكثر أماناً
- يمكن استخدام مكتبات UI جاهزة (shadcn/ui, Ant Design)

### Stack المقترح للـ Admin Panel

```
Framework:  React + Vite + TypeScript
UI:         shadcn/ui أو Ant Design
HTTP:       axios مع interceptors للـ JWT
Auth:       Admin JWT في memory (وليس localStorage)
Hosting:    Cloudflare Pages
Domain:     admin.mazadpay.com
```

### الصفحات الأساسية

- `/login` — تسجيل دخول الإدارة
- `/dashboard` — إحصائيات عامة
- `/auctions` — قائمة المزادات + مراجعة وموافقة
- `/users` — إدارة المستخدمين
- `/messages` — رسائل التواصل
- `/audit-logs` — سجل العمليات

---

## الثاني عشر — Milestones

### Milestone 1 — Backend Skeleton + Health Check
**المدة المقدرة:** 1-2 يوم

```
cmd/server/main.go
internal/config/config.go
internal/router/router.go
GET /health
Dockerfile (اختياري)
.env.example
```

**معيار الاكتمال:** `GET /health` يرد بـ `{"status":"ok"}` على `api.mazadpay.com`

---

### Milestone 2 — Database + Migrations + Users Schema
**المدة المقدرة:** 2-3 أيام

```
db/migrations/001_create_users.sql
db/migrations/002_create_categories.sql
db/migrations/003_create_auctions.sql
db/migrations/004_create_bids.sql
db/migrations/005_create_favorites.sql
db/migrations/006_create_contact_messages.sql
db/migrations/007_create_audit_logs.sql
sqlc.yaml + query files
internal/db/ (generated code)
```

**معيار الاكتمال:** migrations تعمل على Neon staging branch

---

### Milestone 3 — Authentication
**المدة المقدرة:** 3-4 أيام

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
JWT middleware
Rate limiting middleware
```

**معيار الاكتمال:** register + login + refresh + logout تعمل بـ Postman

---

### Milestone 4 — Auctions CRUD
**المدة المقدرة:** 3-5 أيام

```
GET    /api/v1/auctions
GET    /api/v1/auctions/:id
POST   /api/v1/auctions       (auth required)
PUT    /api/v1/auctions/:id   (owner only)
DELETE /api/v1/auctions/:id   (owner only)
GET    /api/v1/categories
```

**معيار الاكتمال:** مستخدم يستطيع إنشاء مزاد + المسؤول يرى المزاد في pending

---

### Milestone 5 — Bids System
**المدة المقدرة:** 2-3 أيام

```
POST /api/v1/auctions/:id/bids
GET  /api/v1/auctions/:id/bids
منطق التحقق: amount > current_price + bid_increment
منطق التحقق: auction status = active, ends_at > now
تحديث current_price و total_bids
```

**معيار الاكتمال:** مزايدة تعمل والسعر الحالي يُحدَّث

---

### Milestone 6 — Image Upload
**المدة المقدرة:** 2-3 أيام

```
POST   /api/v1/auctions/:id/images
DELETE /api/v1/auctions/:id/images/:image_id
ربط Cloudflare R2
validation: type + size + magic bytes
```

**معيار الاكتمال:** صورة تُرفع وتظهر عبر media.mazadpay.com

---

### Milestone 7 — Admin APIs
**المدة المقدرة:** 3-4 أيام

```
POST /api/v1/admin/auth/login
GET  /api/v1/admin/dashboard
GET  /api/v1/admin/auctions
PUT  /api/v1/admin/auctions/:id/status
GET  /api/v1/admin/users
GET  /api/v1/admin/contact-messages
GET  /api/v1/admin/audit-logs
Admin JWT middleware
```

**معيار الاكتمال:** مسؤول يستطيع قبول أو رفض مزاد

---

### Milestone 8 — Production Deployment
**المدة المقدرة:** 1-2 يوم

```
Render deployment
api.mazadpay.com DNS
Neon production database
migrations على production
CORS مضبوط
rate limiting مفعّل
smoke tests على الإنتاج
```

**معيار الاكتمال:** `https://api.mazadpay.com/health` يرد بـ `{"status":"ok"}`

---

## الثالث عشر — Do Not Do ⛔

```
❌ لا تضع secrets أو DATABASE_URL في GitHub
❌ لا تستخدم CORS * في أي بيئة
❌ لا تخزن uploads على Render filesystem كحل نهائي
❌ لا تبدأ نظام Payment قبل اكتمال Auth وAuctions
❌ لا تغيّر الموقع التعريفي الحالي أثناء بناء Backend
❌ لا تضف redirects إلى Cloudflare بدون اختبار على pages.dev أولاً
❌ لا تستخدم SQLite في الإنتاج
❌ لا تخزن JWT في localStorage (استخدم memory + HTTP-only cookie للـ refresh)
❌ لا تطبّق migrations على production مباشرة بدون staging
❌ لا تفتح Admin routes للعموم بدون IP restriction أو VPN
❌ لا تضع بيانات Neon الحقيقية في أي ملف داخل الـ repo
❌ لا تستخدم HTTP في الإنتاج (HTTPS فقط)
❌ لا تنشر Backend بدون /health endpoint يعمل
```

---

## هيكل المشروع المقترح

```
mazadpay-api/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_create_users.up.sql
│   │   │   └── 001_create_users.down.sql
│   │   └── queries/
│   │       └── users.sql
│   ├── handler/
│   │   ├── auth.go
│   │   ├── auction.go
│   │   ├── bid.go
│   │   └── admin.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── admin.go
│   │   └── ratelimit.go
│   ├── model/
│   │   └── (sqlc generated)
│   ├── router/
│   │   └── router.go
│   ├── service/
│   │   ├── auth.go
│   │   ├── auction.go
│   │   └── storage.go
│   └── validator/
│       └── validator.go
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
└── README.md
```

---

## ملخص القرارات التقنية

| القرار | الاختيار | السبب |
|--------|---------|--------|
| Language | Go | أداء، type safety، مثالي للـ API |
| Router | **Fiber** | أداء ممتاز، API بسيط، مجتمع نشط |
| SQL | **sqlc** | type-safe، لا ORM overhead، SQL كامل |
| Auth | JWT + Refresh | معيار صناعي، stateless، قابل للتوسع |
| Password | **bcrypt** cost=12 | معيار أمان مثبت |
| Storage | **Cloudflare R2** | مجاني، zero egress، متكامل مع Cloudflare |
| Database | Neon PostgreSQL | serverless، branching، sslmode=require |
| Hosting | Render | سهل، Go native، health checks |
| Admin UI | React + Cloudflare Pages | منفصل، آمن، قابل للتحديث |

---

*آخر تحديث: 2026-06-05 — هذه وثيقة تخطيط معماري، لا تعديل على الموقع الحالي.*
