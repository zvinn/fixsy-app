# 📱 دليل إعداد Flutter لمشروع Fixsy

## الخطوة 1: تثبيت Flutter (إذا لم يكن مثبتاً)

### ⬇️ تحميل Flutter SDK

1. **روح لموقع Flutter الرسمي:**
   ```
   https://docs.flutter.dev/get-started/install/windows
   ```

2. **حمل Flutter SDK:**
   - اضغط على "Download Flutter SDK for Windows"
   - النسخة المستقرة الحالية (Stable channel)

3. **فك الضغط في مكان مناسب:**
   ```
   C:\src\flutter
   ```
   ⚠️ **مهم:** لا تضعه في مجلد يتطلب صلاحيات Admin مثل `C:\Program Files`

---

## الخطوة 2: إضافة Flutter للـ Path

1. **افتح System Environment Variables:**
   - اضغط `Win + R`
   - اكتب: `sysdm.cpl`
   - اختار `Advanced` → `Environment Variables`

2. **أضف Flutter للـ Path:**
   - في "User variables" اختار `Path` → `Edit`
   - اضغط `New` وأضف:
     ```
     C:\src\flutter\bin
     ```
   - اضغط `OK` على كل النوافذ

3. **اعد تشغيل Terminal:**
   ```powershell
   # افتح PowerShell جديد وجرب:
   flutter --version
   ```

---

## الخطوة 3: تشغيل Flutter Doctor

```powershell
flutter doctor
```

**النتيجة المتوقعة:**
```
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.x.x)
[!] Android toolchain - develop for Android devices
[!] Chrome - develop for the web
[✓] Visual Studio Code (version x.x)
[!] Connected device
```

---

## الخطوة 4: إعداد Android (للموبايل)

### تثبيت Android Studio:

1. **حمل Android Studio:**
   ```
   https://developer.android.com/studio
   ```

2. **افتح Android Studio:**
   - `More Actions` → `SDK Manager`
   - تأكد من تثبيت:
     - ✅ Android SDK Platform
     - ✅ Android SDK Command-line Tools
     - ✅ Android SDK Build-Tools

3. **قبول رخص Android:**
   ```powershell
   flutter doctor --android-licenses
   ```
   (اضغط `y` لقبول كل التراخيص)

---

## الخطوة 5: إنشاء Emulator (اختياري)

### من Android Studio:
1. `More Actions` → `Virtual Device Manager`
2. `Create Device`
3. اختار جهاز (مثلاً: Pixel 6)
4. اختار System Image (API 33 مثلاً)
5. `Finish`

### أو استخدم جهازك الحقيقي:
1. فعّل "Developer Mode" على جهازك
2. فعّل "USB Debugging"
3. وصل الجهاز بالكمبيوتر
4. شغل:
   ```powershell
   flutter devices
   ```

---

## الخطوة 6: التحقق النهائي

```powershell
flutter doctor -v
```

**يجب أن تشوف:**
- ✅ Flutter (Channel stable)
- ✅ Android toolchain
- ✅ VS Code أو Android Studio
- ✅ Connected device

---

## ⚡ الخطوات السريعة (ملخص)

```powershell
# 1. تأكد من التثبيت
flutter --version

# 2. افحص البيئة
flutter doctor

# 3. قبول تراخيص Android
flutter doctor --android-licenses

# 4. شوف الأجهزة المتاحة
flutter devices

# 5. إنشاء مشروع جديد
cd ..
flutter create fixsy_flutter
cd fixsy_flutter

# 6. تشغيل التطبيق
flutter run
```

---

## 🆘 حل المشاكل الشائعة

### ❌ "flutter: command not found"
**الحل:** أضف Flutter للـ Path وأعد تشغيل Terminal

### ❌ "Android licenses not accepted"
**الحل:** 
```powershell
flutter doctor --android-licenses
```

### ❌ "No devices found"
**الحل:** 
- افتح Emulator من Android Studio
- أو وصل جهازك وفعّل USB Debugging

---

## 📞 جاهز للخطوة التالية؟

بعد ما تخلص الخطوات دي، خبرني عشان نبدأ ننشئ مشروع Fixsy Flutter! 🚀

**الأمر التالي:**
```powershell
cd "C:\Users\A PLUS"
flutter create fixsy_flutter --org com.aplus.fixsy
```
