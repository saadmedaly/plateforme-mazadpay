# MazadPay — خارطة الطريق

---

## Phase 1 — الموقع التعريفي الرسمي ✅ مكتمل

**الهدف:** موقع تعريفي احترافي ثابت قابل للنشر.

- [x] Static website: HTML + CSS + JS
- [x] RTL عربي + فرنسي مع تبديل فوري
- [x] نشر على Cloudflare Pages
- [x] دومين مخصص: `mazadpay.com` + `www.mazadpay.com`
- [x] SSL/TLS Full عبر Cloudflare
- [x] صفحة سياسة الخصوصية (`privacy.html`)
- [x] صفحة الشروط والأحكام (`terms.html`)
- [x] ملفات SEO: `robots.txt` + `sitemap.xml`
- [x] Security headers: CSP، X-Frame-Options، nosniff…
- [x] `script-src 'self'` — بدون `unsafe-inline`
- [x] APK modal "قريباً" بدلاً من رابط وهمي
- [x] Social links مع badge "قريباً" بدلاً من روابط وهمية
- [x] FAQ section
- [x] Stats Band
- [x] `QA-CHECKLIST.md` + `DEPLOYMENT.md`

---

## Phase 2 — Backend حقيقي

**الهدف:** تحويل الموقع من تعريفي إلى Marketplace فعلي.

**التقنيات المقترحة:**
- Backend: Go API على Render
- Database: Neon PostgreSQL
- API domain: `api.mazadpay.com`

**المكوّنات:**
- [ ] Authentication (JWT)
- [ ] Users (تسجيل، تسجيل دخول، إدارة الحساب)
- [ ] Auctions CRUD (إنشاء، تعديل، حذف المزادات)
- [ ] Bids (نظام المزايدة في الوقت الحقيقي)
- [ ] Internal Wallet (شحن الرصيد، استرجاع التأمين)
- [ ] Admin Panel (مراجعة عمليات الشحن، الإعلانات)
- [ ] Contact Form (ربط بـ Cloudflare Workers أو Formspree)
- [ ] Image Upload (رفع صور المنتجات)
- [ ] CORS مضبوط للدومينات المسموحة فقط

**متغيرات البيئة المطلوبة:**
```
PORT=8080
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=...
CORS_ALLOWED_ORIGINS=https://mazadpay.com,https://www.mazadpay.com
```

---

## Phase 3 — تخزين الوسائط

**الهدف:** تخزين صور المستخدمين والمنتجات بشكل دائم.

> تحذير: لا تخزّن صور المستخدمين على Render filesystem — تضيع عند كل redeploy.

- [ ] Cloudflare R2 (الأفضل لتكامله مع Cloudflare)
  أو
- [ ] Cloudinary (أسهل في الإعداد)

**متغيرات البيئة المطلوبة (R2):**
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=mazadpay-media
R2_PUBLIC_URL=https://media.mazadpay.com
```

---

## Phase 4 — التطبيق المحمول

**الهدف:** ربط التطبيق بالـ API وإطلاقه رسمياً.

- [ ] ربط التطبيق بـ `api.mazadpay.com`
- [ ] APK حقيقي قابل للتحميل من الموقع
- [ ] نشر على Google Play Store
- [ ] تحديث زر التحميل في الموقع (إزالة modal "قريباً")
- [ ] تحديث QR code بالرابط الحقيقي
- [ ] مراجعة قانونية لـ `privacy.html` و`terms.html` قبل الإطلاق الرسمي

---

## Phase 5 — المراقبة والـ SEO

**الهدف:** قياس الأداء وتحسين الظهور في محركات البحث.

- [ ] Google Search Console (تأجّل لوقت لاحق)
  - إضافة الدومين
  - رفع `sitemap.xml`
  - مراقبة الفهرسة
- [ ] Analytics (Google Analytics أو Cloudflare Analytics)
- [ ] مراقبة uptime (UptimeRobot أو Cloudflare Alerts)
- [ ] تحسين Core Web Vitals
- [ ] Open Graph images محسّنة للمشاركة الاجتماعية

---

*آخر تحديث: 2026-06-05*
