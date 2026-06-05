# MazadPay — الموقع التعريفي الرسمي

موقع تعريفي احترافي لمنصة **MazadPay / مزاد باي** — أول منصة مزادات رقمية في موريتانيا.

**نوع المشروع:** Static HTML + CSS + JavaScript — بدون أي إطار عمل، بدون backend.
**اللغات المدعومة:** العربية (RTL) والفرنسية (LTR) مع تبديل لغة فوري.

---

## التشغيل محلياً

```bash
# Python 3
python -m http.server 5500
```

ثم افتح: `http://localhost:5500`

> يحتاج اتصال إنترنت لتحميل خط Cairo من Google Fonts.

---

## روابط الإنتاج

| الرابط | الوصف |
|--------|-------|
| `https://mazadpay.com` | الصفحة الرئيسية |
| `https://mazadpay.com/privacy.html` | سياسة الخصوصية |
| `https://mazadpay.com/terms.html` | الشروط والأحكام |

---

## النشر

**Cloudflare Pages** مربوط بـ GitHub repository تلقائياً.

| الإعداد | القيمة |
|---------|--------|
| GitHub repo | `saadmedaly/plateforme-mazadpay` |
| Cloudflare project | `mazadpay-site` |
| Build command | `exit 0` (أو فارغ) |
| Output directory | `.` |
| Custom domains | `mazadpay.com` · `www.mazadpay.com` |
| SSL/TLS mode | **Full** |

> تفاصيل كاملة في [DEPLOYMENT.md](DEPLOYMENT.md)

---

## بنية الملفات

```
plateforme-mazadpay/
├── index.html              ← الصفحة الرئيسية
├── privacy.html            ← سياسة الخصوصية
├── terms.html              ← الشروط والأحكام
├── _redirects              ← Cloudflare Pages (معطّل — بدون redirects نشطة)
├── _headers                ← Security headers + Cache headers
├── robots.txt              ← SEO
├── sitemap.xml             ← SEO
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── QA-CHECKLIST.md         ← قائمة فحص قبل كل نشر
├── css/
│   ├── styles.css          ← Foundation: variables, header, footer, buttons
│   └── home.css            ← Home components: hero, cards, timeline, security
├── js/
│   ├── i18n.js             ← Translations (AR/FR) + language engine
│   └── main.js             ← Interactions: menu, modal, reveals, countdowns
└── assets/
    ├── mazadpay-logo.png
    └── mazadpay-logo-transparent.png
```

---

## الهوية البصرية

| العنصر | القيمة |
|--------|--------|
| الأزرق الأساسي | `#2563EB` |
| الكحلي (النصوص) | `#0B1B3B` |
| الرمادي الثانوي | `#F5F7FB` |
| الأخضر (الثقة فقط) | `#15A35A` |
| الخط | Cairo (Google Fonts) |

---

## ملاحظات مهمة

- **لا تستخدم `/privacy` أو `/terms` كروابط** — تسبب redirect loop على Cloudflare Pages.
  استخدم دائماً `privacy.html` و`terms.html`.
- **لا تضف SPA fallback** في `_redirects` (`/* /index.html 200`) — المشروع Static وليس SPA.
- **لا تضع أسرار أو `.env`** داخل الكود أو الـ repository.
- **نموذج التواصل والبحث** واجهة أمامية فقط — لا يرسلان بيانات.
- **APK وGoogle Play** غير نشطين حتى إطلاق التطبيق الرسمي.

---

© 2026 MazadPay — نواكشوط، موريتانيا
