# MazadPay — دليل النشر

## نوع المشروع
موقع تعريفي ثابت — HTML + CSS + JavaScript — لا يحتاج إلى build أو backend.

---

## 1. تشغيل المشروع محلياً

```bash
# Python 3 (الطريقة الأبسط)
python -m http.server 5500

# أو Node.js
npx serve .
```
ثم افتح: `http://localhost:5500`

---

## 2. النشر على Cloudflare Pages

### الخطوات:

1. اذهب إلى [Cloudflare Pages](https://pages.cloudflare.com)
2. اختر **"Create a project"** → **"Connect to Git"**
3. اختر مستودع `plateforme-mazadpay`
4. اضبط الإعدادات:

| الإعداد | القيمة |
|---------|--------|
| **Framework preset** | `None` |
| **Build command** | *(اتركه فارغاً)* |
| **Build output directory** | `/` |
| **Root directory** | `/` |

5. انقر **Save and Deploy**

### الدومين المخصص:
بعد النشر، أضف الدومين من: **Pages → Custom domains → Add domain**
```
mazadpay.com
www.mazadpay.com
```

### ملفات مهمة لـ Cloudflare Pages:
- `_redirects` — redirects وSPA fallback
- `_headers` — Security headers وCache headers

---

## 3. إعداد DNS على Cloudflare

| النوع | الاسم | القيمة |
|-------|-------|--------|
| CNAME | `@` | `<your-pages-subdomain>.pages.dev` |
| CNAME | `www` | `<your-pages-subdomain>.pages.dev` |

> تأكد من تفعيل **Proxied (الغيمة البرتقالية)** للحماية وإخفاء الـ IP.

---

## 4. SSL / HTTPS

Cloudflare يوفر SSL مجاناً تلقائياً عبر **Universal SSL**.
لا حاجة لإعداد يدوي.

---

## 5. هيكل الملفات المهمة

```
plateforme-mazadpay/
├── index.html          ← الصفحة الرئيسية
├── privacy.html        ← سياسة الخصوصية
├── terms.html          ← الشروط والأحكام
├── _redirects          ← Cloudflare Pages redirects
├── _headers            ← Security & cache headers
├── robots.txt          ← SEO
├── sitemap.xml         ← SEO (غيّر الدومين عند الحاجة)
├── .gitignore          ← Git ignore
├── css/
│   ├── styles.css
│   └── home.css
├── js/
│   ├── i18n.js
│   └── main.js
└── assets/
    ├── mazadpay-logo.png
    └── mazadpay-logo-transparent.png
```

---

## 6. ملاحظات مهمة

- **APK**: التطبيق لم يُنشر بعد. زر التحميل يعرض modal "قريباً".
- **Google Play**: معطّل مؤقتاً حتى اكتمال النشر على المتجر.
- **Social Media**: روابط Facebook/Instagram ستُضاف عند إنشاء الصفحات الرسمية.
- **Contact Form**: يعمل front-end فقط. لإرسال البريد الإلكتروني الفعلي، يجب إضافة Cloudflare Workers أو خدمة مثل Formspree لاحقاً.
- **sitemap.xml**: غيّر `mazadpay.com` بالدومين الفعلي إذا اختلف.

---

## 7. للمستقبل — إضافة Backend

إذا احتاج المشروع لاحقاً إلى API:
- **Backend**: Go API على Render
- **Database**: Neon PostgreSQL
- **Images**: Cloudflare R2 أو Cloudinary
- **Contact Form**: Cloudflare Workers أو Formspree

---

*آخر تحديث: 2026-06-05*
