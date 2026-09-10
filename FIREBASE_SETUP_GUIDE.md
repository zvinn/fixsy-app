# 🔥 دليل إعداد Firebase خطوة بخطوة

## نظرة عامة

هذا الدليل يوضح كيفية إصلاح مشاكل Firebase Permissions وتفعيل جميع ميزات تطبيق Fixsy.

**المشاكل الحالية:**
- ❌ صفحة السوق: `Permission Denied`
- ❌ صفحة طلباتي: عالقة في Loading
- ❌ صفحة حسabي: عالقة في Loading
- ❌ الإشعارات: غير مفعلة

**بعد الإعداد:**
- ✅ جميع الصفحات ستعمل بشكل صحيح
- ✅ المستخدمون يمكنهم رؤية بياناتهم
- ✅ الإشعارات ستعمل

---

## الخطوة 1: نشر قواعد Firestore 🔐

### 1.1 تثبيت Firebase CLI

افتح PowerShell كمسؤول وقم بتثبيت Firebase CLI:

```powershell
npm install -g firebase-tools
```

### 1.2 تسجيل الدخول إلى Firebase

```powershell
firebase login
```

سيفتح متصفح لتسجيل الدخول بحساب Google الخاص بك.

### 1.3 التحقق من المشروع

```powershell
cd "c:\Users\A PLUS\fixsy-app"
firebase projects:list
```

يجب أن ترى مشروع `fixsy-app-1d3b7` في القائمة.

### 1.4 نشر قواعد Firestore

```powershell
firebase deploy --only firestore:rules
```

**النتيجة المتوقعة:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/fixsy-app-1d3b7/overview
```

---

## الخطوة 2: إعداد Firebase Console يدوياً 🌐

إذا واجهت مشاكل مع CLI، يمكنك نشر القواعد يدوياً:

### 2.1 افتح Firebase Console

1. اذهب إلى: https://console.firebase.google.com
2. اختر مشروع `fixsy-app-1d3b7`

### 2.2 نشر قواعد Firestore

1. من القائمة الجانبية، اختر **Firestore Database**
2. اضغط على تبويب **Rules**
3. انسخ محتوى ملف [`firestore.rules`](file:///c:/Users/A%20PLUS/fixsy-app/firestore.rules)
4. الصقه في محرر القواعد
5. اضغط **Publish**

![Firestore Rules Location](https://i.imgur.com/example.png)

### 2.3 تفعيل Firebase Authentication

1. من القائمة الجانبية، اختر **Authentication**
2. اضغط **Get Started**
3. من تبويب **Sign-in method**، فعّل:
   - ✅ **Google** (الأساسي)
   - ⚙️ أضف Authorized domains: `localhost`, `fixsy-app-1d3b7.web.app`

### 2.4 تفعيل Cloud Firestore

1. من **Firestore Database**، اضغط **Create database**
2. اختر **Start in production mode**
3. اختر موقع الخادم: `europe-west1` (الأقرب لمصر)
4. اضغط **Enable**

---

## الخطوة 3: إعداد Firebase Cloud Messaging (FCM) 📲

### 3.1 توليد مفتاح VAPID

1. في Firebase Console، اذهب إلى **Project Settings** (⚙️ أعلى يسار)
2. اختر تبويب **Cloud Messaging**
3. في قسم **Web Push certificates**، اضغط **Generate key pair**
4. انسخ المفتاح الذي ظهر (يبدأ بـ `B...`)

### 3.2 تحديث ملف `.env`

أضف المفتاح إلى ملف `.env`:

```env
VITE_FIREBASE_VAPID_KEY=B...your_key_here
```

### 3.3 إنشاء Service Worker (إذا لم يكن موجوداً)

أنشئ ملف `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "fixsy-app-1d3b7.firebaseapp.com",
  projectId: "fixsy-app-1d3b7",
  storageBucket: "fixsy-app-1d3b7.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/fixsy-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

---

## الخطوة 4: التحقق من متغيرات البيئة ✅

### 4.1 مراجعة ملف `.env`

تأكد من أن ملف `.env` يحتوي على جميع القيم المطلوبة:

**قائمة المتغيرات المطلوبة:**

#### Firebase (مطلوب)
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=fixsy-app-1d3b7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fixsy-app-1d3b7
VITE_FIREBASE_STORAGE_BUCKET=fixsy-app-1d3b7.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=B...
```

#### الحصول على قيم Firebase
1. اذهب إلى: https://console.firebase.google.com/project/fixsy-app-1d3b7/settings/general
2. في قسم **Your apps**، اختر تطبيق الويب
3. انسخ جميع القيم من `firebaseConfig`

#### Cloudinary (مطلوب لرفع الصور)
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

**الحصول عليها:**
1. سجل في: https://cloudinary.com/
2. من Dashboard، انسخ Cloud Name
3. في Settings → Upload → Upload presets، أنشئ preset جديد (unsigned)

#### AI Services (مطلوب للميزات الذكية)
```env
VITE_GROQ_API_KEY=gsk_...
VITE_GEMINI_API_KEY=AIza...
```

**الحصول عليها:**
- Groq: https://console.groq.com/keys
- Gemini: https://aistudio.google.com/app/apikey

### 4.2 إعادة تشغيل السيرفر

بعد تحديث `.env`:

```powershell
# أوقف السيرفر (Ctrl+C)
npm start
```

---

## الخطوة 5: الاختبار النهائي 🧪

### 5.1 اختبار الصفحات

افتح `http://localhost:3000` واختبر:

- [ ] **الصفحة الرئيسية**: يجب أن تظهر قائمة الفنيين
- [ ] **صفحة السوق**: يجب أن تعرض الطلبات (أو "لا توجد طلبات")
- [ ] **طلباتي**: يجب أن تعرض طلباتك بعد تسجيل الدخول
- [ ] **حسابي**: يجب أن تعرض بياناتك الشخصية

### 5.2 اختبار Console

افتح Developer Tools (F12) → Console:

**يجب أن تختفي هذه الأخطاء:**
- ❌ `FirebaseError [code=permission-denied]`
- ❌ `fetchError`

**قد تظهر هذه (طبيعية في بداية التطوير):**
- ⚠️ `No user logged in` (حتى تسجل الدخول)
- ℹ️ Warnings عن الأداء (يمكن تجاهلها)

---

## استكشاف الأخطاء 🔧

### مشكلة: "Permission Denied" مازالت موجودة

**الحل:**
1. تأكد من نشر القواعد بنجاح
2. امسح cache المتصفح (Ctrl+Shift+Delete)
3. سجل خروج ثم سجل دخول مرة أخرى
4. تحقق من Console أن `request.auth` موجود

### مشكلة: "Firebase API key not valid"

**الحل:**
1. تحقق من ملف `.env` أن المفاتيح صحيحة ولا تحتوي على مسافات
2. تأكد أن الملف اسمه `.env` وليس `.env.txt`
3. أعد تشغيل `npm start`

### مشكلة: "Module not found: Error: Can't resolve"

**الحل:**
```powershell
npm install
npm start
```

---

## الأوامر السريعة 📝

### نشر كل شيء
```powershell
firebase deploy
```

### نشر القواعد فقط
```powershell
firebase deploy --only firestore:rules
```

### نشر الموقع فقط
```powershell
npm run build
firebase deploy --only hosting
```

### عرض سجل Firebase
```powershell
firebase functions:log
```

---

## موارد إضافية 📚

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [ملف firestore.rules الحالي](file:///c:/Users/A%20PLUS/fixsy-app/firestore.rules)
- [ملف .env.example](file:///c:/Users/A%20PLUS/fixsy-app/.env.example)

---

## ملخص سريع ⚡

```powershell
# 1. تثبيت Firebase CLI
npm install -g firebase-tools

# 2. تسجيل الدخول
firebase login

# 3. الانتقال للمشروع
cd "c:\Users\A PLUS\fixsy-app"

# 4. نشر القواعد
firebase deploy --only firestore:rules

# 5. إعادة تشغيل السيرفر
npm start
```

**بعد ذلك:** اختبر التطبيق والتأكد من اختفاء أخطاء Permissions! ✅
