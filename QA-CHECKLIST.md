# MazadPay — قائمة فحص ما قبل النشر

نفّذ هذه القائمة قبل كل `git push` يستهدف الإنتاج.

---

## الصفحات

- [ ] `http://localhost:5500/` تفتح بدون أخطاء
- [ ] `http://localhost:5500/privacy.html` تفتح بدون أخطاء
- [ ] `http://localhost:5500/terms.html` تفتح بدون أخطاء
- [ ] لا توجد صفحة 404 على الروابط الأساسية

## الشعار والصور

- [ ] شعار الهيدر يظهر (`mazadpay-logo-transparent.png`)
- [ ] شعار الفوتر يظهر (`mazadpay-logo.png`)
- [ ] لا توجد صور مكسورة (broken images)
- [ ] favicon يظهر في تاب المتصفح

## CSS والتصميم

- [ ] خط Cairo يُحمَّل بشكل صحيح
- [ ] الألوان متناسقة (Blue #2563EB، Navy #0B1B3B)
- [ ] لا تداخل بين العناصر
- [ ] Hero section يظهر بشكل صحيح
- [ ] Cards لا تتداخل

## JavaScript

- [ ] لا توجد `console.error` في Developer Tools
- [ ] لا توجد `console.warn` مهمة
- [ ] `window.I18N` موجود ومحمّل
- [ ] `window.toggleLang` يعمل
- [ ] countdown timers تعمل

## Mobile Menu

- [ ] زر Burger يظهر على الشاشات الصغيرة (أقل من 920px)
- [ ] القائمة تنفتح وتنغلق بضغطة واحدة
- [ ] `aria-expanded` يتغيّر بشكل صحيح
- [ ] الضغط على Escape يغلق القائمة
- [ ] الضغط خارج القائمة يغلقها

## RTL والعربية

- [ ] `<html dir="rtl">` عند تشغيل العربية
- [ ] `<html dir="ltr">` عند تشغيل الفرنسية
- [ ] النصوص العربية غير مكسورة
- [ ] الاتجاه صحيح في Navbar وFooter والبطاقات
- [ ] أسهم الروابط في الاتجاه الصحيح

## Responsive

- [ ] الموقع يعمل على Desktop (1280px+)
- [ ] الموقع يعمل على Tablet (768px)
- [ ] الموقع يعمل على Mobile (375px)
- [ ] Hero section لا ينكسر على الموبايل
- [ ] Footer لا ينكسر على الموبايل

## Language Toggle

- [ ] زر FR/AR يبدّل اللغة
- [ ] كل النصوص تتغيّر عند التبديل
- [ ] الاتجاه (RTL/LTR) يتغيّر
- [ ] اختيار اللغة يُحفظ في localStorage

## APK Modal

- [ ] زر "تحميل التطبيق" يفتح الـ modal
- [ ] زر "زايد الآن" على البطاقات يفتح الـ modal
- [ ] زر الإغلاق يعمل
- [ ] Escape يغلق الـ modal
- [ ] الضغط خارج الـ modal يغلقه

## الروابط

- [ ] جميع روابط Navbar تعمل (scroll إلى الأقسام)
- [ ] `privacy.html` يفتح بشكل صحيح (ليس `/privacy`)
- [ ] `terms.html` يفتح بشكل صحيح (ليس `/terms`)
- [ ] رابط واتساب يفتح (`https://wa.me/22232816779`)
- [ ] رابط البريد الإلكتروني يعمل (`mailto:`)
- [ ] رابط الهاتف يعمل (`tel:`)

## SEO

- [ ] `robots.txt` يُحمَّل: `http://localhost:5500/robots.txt`
- [ ] `sitemap.xml` يُحمَّل: `http://localhost:5500/sitemap.xml`
- [ ] canonical tag موجود في `index.html`
- [ ] og:image يشير إلى صورة موجودة
- [ ] title وdescription مناسبان

## ملفات Cloudflare Pages

- [ ] `_redirects` لا يحتوي على redirects نشطة
- [ ] `_redirects` لا يحتوي على `/* /index.html 200`
- [ ] `_redirects` لا يحتوي على `/privacy /privacy.html`
- [ ] `_headers` يحتوي على CSP صحيح
- [ ] `script-src` لا يحتوي على `unsafe-inline`

## Git

- [ ] `git status` نظيف قبل الـ push
- [ ] لا يوجد `.env` أو secrets في الـ staging area
- [ ] `.gitignore` يستبعد `.thumbnail` و`.DS_Store` والـ `node_modules`

## Cloudflare Pages بعد النشر

- [ ] Deployment نجح في dashboard
- [ ] `https://mazadpay-site.pages.dev/` تفتح
- [ ] `https://mazadpay-site.pages.dev/privacy.html` تفتح بدون redirect loop
- [ ] `https://mazadpay-site.pages.dev/terms.html` تفتح بدون redirect loop
- [ ] `https://mazadpay.com/` تفتح
- [ ] `https://mazadpay.com/privacy.html` تفتح
- [ ] `https://mazadpay.com/terms.html` تفتح
- [ ] `https://www.mazadpay.com/` تفتح

---

*آخر تحديث: 2026-06-05*
