# معرض أعمال شخصي (Frontend)

واجهة Portfolio عربية RTL مبنية بـ React + Vite + CSS عادي (بدون Tailwind)، مع لوحة إدارة مستقلة.

> **الحالة:** React متصل بخدمات Django حسب الإعداد في `.env`؛ راجع واجهات كل مورد وما هو متاح في صفحات الإدارة.

## التشغيل

يتطلب Vite 8 إصدار Node.js 20.19+ أو 22.12+.

```bash
npm install
npm run dev      # للتطوير
npm run build    # ينتج مجلد dist
npm test         # اختبارات تحويل بيانات موارد الإدارة
npm run preview  # معاينة النسخة المبنية
```

انسخ `.env.example` إلى `.env.local`. اترك `VITE_API_BASE_URL` فارغًا للتطوير المحلي كي تستخدم الواجهة اسم المضيف الحالي نفسه (مثل `localhost` أو `127.0.0.1`) مع منفذ API `8000`؛ هذا مهم لإرسال كوكيز الجلسة وCSRF. إذا ضبطته يدويًا، استخدم نفس اسم المضيف الذي فتحت به الواجهة. يلزم أن يسمح Django بأصل الواجهة في `CORS_ALLOWED_ORIGINS` و`CSRF_TRUSTED_ORIGINS`. للجلسات بين نطاقين مختلفين، يلزم HTTPS و`COOKIE_SAMESITE=None`؛ يفضّل نشر الواجهة وAPI على نفس الموقع لتجنّب حظر كوكيز الطرف الثالث في المتصفحات.

## المسارات

الموقع يستخدم `HashRouter` (الروابط على شكل `#/projects/slug`) ليعمل على GitHub Pages دون إعداد.

| المسار | الصفحة |
|---|---|
| `#/` | الرئيسية |
| `#/projects/:slug` | تفاصيل مشروع (المنشور فقط) |
| `#/admin/login` | دخول المسؤول عبر كلمة المرور ثم OTP من Backend |
| `#/admin/...` | الإدارة: profile, projects, skills, experience, certificates, messages, icons, design, statistics, account |

## الرفع على GitHub Pages

1. أنشئ مستودعًا على GitHub وارفع المشروع:
   ```bash
   git init && git add . && git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
2. من **Settings → Pages** اختر **Source: GitHub Actions**.
3. أي دفع إلى `main` ينشر الموقع تلقائيًا عبر `.github/workflows/deploy.yml`.

الإعداد `base: './'` في `vite.config.js` يجعل الموقع يعمل داخل مسار المستودع.

## إعداد مصادقة Backend

- افتراضيًا تتصل الواجهة بعنوان API على المنفذ `8000` مع اسم المضيف نفسه المستخدم لفتح الواجهة. لا تستخدم `localhost` للواجهة و`127.0.0.1` للـ API معًا؛ فهما مضيفان مختلفان بالنسبة إلى كوكيز المتصفح. يمكن تجاوز العنوان عبر `VITE_API_BASE_URL`.
- يسجل الدخول عبر `/auth/csrf/` ثم `/auth/login/` و`/auth/verify-otp/`. الجلسة تبقى في Cookie HttpOnly، ويُستخدم CSRF من الذاكرة.
- طلبات API المصرح بها ترسل Cookies (`withCredentials`)؛ طلبات الكتابة تضيف `X-CSRFToken`. لا تخزن بيانات اعتماد أو رموز دخول في Web Storage.
- في إعداد Django التطويري يظهر OTP في طرفية `runserver` لأن البريد مضبوط على Console backend.

## بيانات التطبيق

- تُقرأ البيانات العامة من `/public/`، وتُحمّل بيانات الإدارة بعد التحقق من `/auth/me/`.
- التنظيف الأمني لـ SVG وصلاحيات الإدارة يجب أن تتم في Backend؛ فحص الواجهة في `src/utils/svg.js` للعرض فقط.
- عمليات الصور تستخدم multipart وتتطلب JPG/PNG/WEBP فقط وبحد أقصى 5MB.
- للانتقال إلى استضافة تدعم إعادة كتابة المسارات (Netlify / Cloudflare Pages) استبدل `HashRouter` بـ `BrowserRouter` في `App.jsx`.
