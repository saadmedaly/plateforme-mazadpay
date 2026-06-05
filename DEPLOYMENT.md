# MazadPay — دليل النشر

**نوع المشروع:** Static HTML + CSS + JavaScript — لا build، لا backend، لا dependencies.

---

## 1. تشغيل محلي

```bash
python -m http.server 5500
```
افتح: `http://localhost:5500`

---

## 2. Cloudflare Pages

| الإعداد | القيمة |
|---------|--------|
| **GitHub repo** | `saadmedaly/plateforme-mazadpay` |
| **Cloudflare project** | `mazadpay-site` |
| **Framework preset** | `None` |
| **Build command** | `exit 0` |
| **Output directory** | `.` |
| **Root directory** | `/` |

### Custom domains
```
mazadpay.com
www.mazadpay.com
```

### SSL/TLS
**يجب أن يكون: Full** — وليس Flexible.
(Flexible يسبب redirect loop بين HTTP وHTTPS)

---

## 3. DNS على Cloudflare

| النوع | الاسم | القيمة | Proxy |
|-------|-------|--------|-------|
| CNAME | `@` | `mazadpay-site.pages.dev` | Proxied ✅ |
| CNAME | `www` | `mazadpay-site.pages.dev` | Proxied ✅ |

---

## 4. ملفات Cloudflare Pages المهمة

### `_redirects`
**معطّل بالكامل — بدون redirects نشطة.**

> تحذير: لا تضف `/privacy /privacy.html` أو `/terms /terms.html` — سببت redirect loop سابقاً على Cloudflare Pages.
> لا تضف `/* /index.html 200` — المشروع Static وليس SPA.

### `_headers`
يحتوي على:
- Security headers (CSP, X-Frame-Options, nosniff…)
- Cache-Control للأصول والـ CSS والـ JS

---

## 5. بعد كل push

Cloudflare Pages يعيد النشر تلقائياً من `main` branch.
راقب: **Workers & Pages → mazadpay-site → Deployments**

---

## 6. اختبار ما بعد النشر

```
https://mazadpay.com/
https://mazadpay.com/privacy.html
https://mazadpay.com/terms.html
https://www.mazadpay.com/
```

> اختبر دائماً الروابط بـ `.html` وليس بدونها.

---

## 7. ملاحظات حالة المشروع

| العنصر | الحالة |
|--------|--------|
| APK | غير جاهز — modal "قريباً" |
| Google Play | معطّل حتى نشر التطبيق |
| Facebook / Instagram | غير مفعّلة — badge "قريباً" |
| Contact Form | Front-end فقط — لا يرسل بيانات |
| Search Bar | Front-end فقط |

---

## 8. للمستقبل

| الخدمة | الغرض |
|--------|-------|
| Cloudflare Workers / Formspree | ربط نموذج التواصل |
| Go API على Render | Backend إذا احتاج المشروع |
| Neon PostgreSQL | قاعدة البيانات |
| Cloudflare R2 / Cloudinary | تخزين الصور |

---

*آخر تحديث: 2026-06-05*
