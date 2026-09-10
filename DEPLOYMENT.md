# 🚀 دليل النشر (Deployment Guide)

## 1️⃣ التحضير للنشر

تأكد من أن الكود نظيف وجاهز:
```bash
# التأكد من عدم وجود أخطاء في الـ Types
npm run type-check

# التأكد من اجتياز جميع الاختبارات
npm run test
```

## 2️⃣ بناء النسخة النهائية (Build)

قوم بعمل Build للمشروع لإنشاء ملفات الـ Production:
```bash
npm run build
```
سيتم إنشاء مجلد `dist` يحتوي على الملفات الجاهزة.

## 3️⃣ النشر على Firebase Hosting

تأكد من تسجيل الدخول:
```bash
firebase login
```

نفذ أمر النشر:
```bash
firebase deploy
```

أو لنشر الـ Hosting فقط:
```bash
firebase deploy --only hosting
```

## 4️⃣ التحقق بعد النشر

- تأكد من عمل الـ Service Worker (يجب أن يعمل التطبيق offline).
- جرب تسجيل الدخول وإنشاء طلب جديد.
- تأكد من عمل ميزات الذكاء الاصطناعي.

## ⚠️ ملاحظات هامة

- تأكد من إعداد نطاق الـ Domain في Firebase Console > Hosting.
- تأكد من إضافة الـ Domain في قائمة الـ Authorized Domains في Firebase Auth.
