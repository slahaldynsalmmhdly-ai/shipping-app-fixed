# تطبيق شحن سريع - Shipping App

تطبيق "شحن سريع" هو الحل الأمثل لربط أصحاب البضائع مع أصحاب الشاحنات في جميع أنحاء المملكة العربية السعودية.

## 🔧 التعديلات الأخيرة

### إصلاح زر حذف المنشور في المنشورات النصية

تم إصلاح مشكلة عدم ظهور زر حذف المنشور في المنشورات النصية (GeneralPost) في صفحة الملف الشخصي.

**الملفات المعدلة:**
- `components/home/GeneralPost.tsx` - تم جعل props `isOwner` و `onDeletePost` اختيارية
- `components/profile/EditProfileCompanyScreen.tsx` - تصحيح استيراد CSS

**التغييرات التقنية:**
```typescript
// قبل:
isOwner: boolean;
onDeletePost: () => void;

// بعد:
isOwner?: boolean;
onDeletePost?: () => void;
```

## 🚀 التثبيت والتشغيل

**Prerequisites:** Node.js 22.x

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key (optional)

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🔑 الإعدادات

التطبيق يستخدم Firebase للمصادقة وقاعدة البيانات. الإعدادات موجودة في ملف `config.ts`.

## 📱 المميزات

- نظام مصادقة متكامل (Firebase Authentication)
- إنشاء وإدارة المنشورات (منشورات نصية، إعلانات شحن، شاحنات فارغة)
- نظام الدردشة الفورية
- تتبع الشحنات المباشر
- إدارة الأسطول
- نظام التقييمات والمراجعات
- المكالمات الصوتية والمرئية (WebRTC)
- نظام الإشعارات
- البحث عن الشركات والمنشورات

## 📂 هيكل المشروع

```
├── components/          # جميع مكونات React
│   ├── home/           # الصفحة الرئيسية والمنشورات
│   ├── profile/        # صفحات الملف الشخصي
│   ├── chat/           # نظام الدردشة
│   ├── ads/            # إدارة الإعلانات
│   └── ...
├── utils/              # وظائف مساعدة
├── data/               # بيانات ثابتة
├── config.ts           # إعدادات Firebase
└── firebase.ts         # تهيئة Firebase
```

## 🐛 الإبلاغ عن المشاكل

إذا واجهت أي مشكلة، يرجى فتح issue في المستودع.

## 📄 الترخيص

جميع الحقوق محفوظة © 2025

