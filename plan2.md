# خطة تحويل الموقع ليكون قابل للتحكم الكامل من الأدمن — Plan 2

## الهدف العام
تحويل جميع المحتوى الثابت (Hardcoded) في الموقع ليصبح ديناميكياً وقابلاً للتعديل بالكامل من لوحة تحكم الأدمن، مع تحسين أداء رفع وتحميل الوسائط.

---

## المرحلة 1: GallerySection — التحكم الكامل في المعرض والفعالية القادمة

### 1.1 الفعالية القادمة (Upcoming Event Card)
**الوضع الحالي:** النصوص ثابتة في الكود:
- العنوان: "نبني الأطفال واحداً تلو الآخر"
- الوصف: "التعلم يتدفق من ينابيع المعرفة. انضم لعائلة عبقري"
- التاريخ: "07 مارس 2025"
- Badge: "فعالية قادمة"
- الخلفية: ألوان فقط (gradient)

**المطلوب:**
- إضافة setting جديد بمفتاح `upcoming_event` في الـ database
- البيانات المخزنة:
  ```typescript
  interface UpcomingEvent {
    badge: string;           // "فعالية قادمة"
    title: string;           // العنوان الرئيسي
    description: string;     // الوصف
    date: string;            // التاريخ
    backgroundType: "gradient" | "image"; // نوع الخلفية
    backgroundImage?: string; // URL صورة الخلفية (اختياري)
    backgroundGradient?: string; // CSS gradient class (اختياري)
    visible: boolean;        // إظهار/إخفاء الفعالية
  }
  ```

**التغييرات المطلوبة:**

#### Backend:
- لا حاجة لتغييرات — نظام key-value الحالي في `SiteSetting` يدعم أي بنية بيانات

#### Frontend — `use-public-settings.ts`:
- إضافة `upcoming_event?: UpcomingEvent` إلى `PublicSettings` interface

#### Frontend — `GallerySection.tsx`:
- استيراد `usePublicSettings`
- قراءة `settings?.upcoming_event` واستخدامه مع fallback للقيم الحالية
- دعم خلفية صورة: إذا كان `backgroundType === "image"` يعرض `<img>` كخلفية بدل الـ gradient

#### Frontend — `SettingsTab.tsx`:
- إضافة قسم "الفعالية القادمة" مع:
  - Input للعنوان
  - Textarea للوصف
  - Input للتاريخ
  - Input لنص الـ Badge
  - Toggle لإظهار/إخفاء
  - Radio/Select لنوع الخلفية (لون/صورة)
  - Image uploader إذا اختار صورة
  - حقل النص للتدرج اللوني إذا اختار لون

### 1.2 بطاقات صور المعرض (Gallery Cards)
**الوضع الحالي:** النصوص على صور المعرض ثابتة:
- الكارت الأول: Badge "بطولة عبقري" + عنوان "تكريم الأبطال والفائزين" + وصف
- الكارت الثاني: Badge "فعالية تعليمية" + عنوان "فعاليات تفاعلية ممتعة" + وصف
- الصور: `gallery1` و `gallery2` (موجودة في إدارة الصور)

**المطلوب:**
- إضافة setting جديد بمفتاح `gallery_cards` في الـ database
- البيانات:
  ```typescript
  interface GalleryCard {
    badge: string;
    badgeColor: string;       // "bg-accent" | "bg-primary" | custom
    title: string;
    description: string;
    imageKey: string;          // "gallery1" | "gallery2" (يستخدم نفس نظام الصور الحالي)
  }
  ```

**التغييرات المطلوبة:**

#### Frontend — `use-public-settings.ts`:
- إضافة `gallery_cards?: GalleryCard[]` إلى `PublicSettings`

#### Frontend — `GallerySection.tsx`:
- قراءة `settings?.gallery_cards` بدلاً من النصوص الثابتة

#### Frontend — `SettingsTab.tsx`:
- إضافة قسم "بطاقات المعرض" مع إمكانية تعديل النصوص لكل بطاقة

---

## المرحلة 2: SkillsSection — التحكم في المهارات والمواد

### 2.1 صور gallery3 و gallery4 مع النصوص
**الوضع الحالي:**
- `gallery3` و `gallery4` صور موجودة بالفعل في `fallbackImages` و `usePublicSettings`
- لكن النصوص المكتوبة عليها ثابتة في الكود:
  - بطاقة "الثقة تبني مستقبلاً أكثر إشراقاً" + "نمكّن الأطفال بالثقة..."
  - بطاقة "نساعد الأطفال على تحقيق أحلامهم" + "نلهم الأطفال..."

**المطلوب:**
- إضافة setting جديد بمفتاح `skills_cards` في الـ database
- البيانات:
  ```typescript
  interface SkillCard {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;      // "#contact" | "#programs" | custom
    imageKey: string;         // "gallery3" | "gallery4"
  }
  ```

**التغييرات:**

#### Frontend — `use-public-settings.ts`:
- إضافة `skills_cards?: SkillCard[]` إلى `PublicSettings`

#### Frontend — `SkillsSection.tsx`:
- قراءة `settings?.skills_cards` واستخدامه مع fallback

#### Frontend — `SettingsTab.tsx`:
- إضافة قسم لتعديل نصوص بطاقات المهارات

### 2.2 SUBJECTS — المواد الدراسية
**الوضع الحالي:** ثابتة في `constants.ts`
```typescript
SUBJECTS = [
  { title: { ar: "التعرف على الأرقام" }, grade: { ar: "تمهيدي" } },
  ...
]
```

**المطلوب:**
- إضافة setting بمفتاح `subjects`
- البيانات:
  ```typescript
  interface SubjectData {
    title: string;
    grade: string;
  }
  ```

**التغييرات:**

#### Frontend — `use-public-settings.ts`:
- إضافة `subjects?: SubjectData[]` إلى `PublicSettings`

#### Frontend — `SkillsSection.tsx`:
- استبدال `SUBJECTS` بـ `settings?.subjects` مع fallback لـ `SUBJECTS`

#### Frontend — `SettingsTab.tsx`:
- إضافة قسم "المواد الدراسية" مع إمكانية إضافة/تعديل/حذف

### 2.3 SKILLS_GRID
**الوضع الحالي:** ثابت في `constants.ts` (معطّل حالياً في الكود — محاط بتعليق)

**المطلوب:**
- الـ `skills` setting موجود بالفعل في `PublicSettings`
- فقط نحتاج إضافة UI لإدارته في `SettingsTab.tsx`
- إضافة قسم "شبكة المهارات" مع إمكانية تعديل العنوان واللون لكل مهارة

---

## المرحلة 3: EmpowerSection — التحكم الكامل

### الوضع الحالي
كل النصوص والأرقام ثابتة:
- عنوان "التسجيل مستمر"
- عنوان رئيسي "مكّن أطفالك ليفكروا بشكل أذكى وأسرع"
- وصف طويل
- نص زر CTA
- إحصائيات: "45M+ مشاهدات" و "164+ دولة"

### المطلوب
- إضافة setting بمفتاح `empower_section`
- البيانات:
  ```typescript
  interface EmpowerSection {
    subtitle: string;         // "التسجيل مستمر"
    title: string;            // العنوان الرئيسي
    titleHighlight: string;   // "أذكى وأسرع" (الجزء الملون)
    description: string;      // الوصف
    ctaText: string;          // نص الزر
    stats: {
      value: string;          // "45M+"
      label: string;          // "مشاهدات عالمية"
      icon: string;           // "check" | "globe"
      iconColor: string;      // "text-emerald-400" | "text-accent"
    }[];
  }
  ```

### التغييرات

#### Frontend — `use-public-settings.ts`:
- إضافة `empower_section?: EmpowerSection` إلى `PublicSettings`

#### Frontend — `EmpowerSection.tsx`:
- استيراد `usePublicSettings`
- قراءة `settings?.empower_section` مع fallback للقيم الحالية

#### Frontend — `SettingsTab.tsx`:
- إضافة قسم "قسم التمكين" مع:
  - حقول لجميع النصوص
  - إمكانية إضافة/تعديل/حذف الإحصائيات

---

## المرحلة 4: Constants — نقل جميع الثوابت للأدمن

### 4.1 SITE_CONFIG
**الوضع الحالي:** `site_config` موجود بالفعل في `PublicSettings` interface لكن لا يوجد UI لإدارته

**المطلوب:**
- إضافة قسم "إعدادات الموقع الأساسية" في `SettingsTab.tsx` مع:
  - اسم الموقع (عربي/إنجليزي)
  - الشعار النصي (عربي/إنجليزي)
  - الوصف (عربي/إنجليزي)
  - رقم الواتساب (موجود بالفعل في التواصل)

### 4.2 PROGRAMS
**الوضع الحالي:** ✅ موجود بالفعل في الأدمن — البرامج يمكن إدارتها من لوحة التحكم
**لا حاجة لتغيير** — فقط التأكد من أن `ProgramsSection.tsx` يستخدم الـ admin settings (وهو يفعل ذلك بالفعل)

### 4.3 WHY_CARDS
**الوضع الحالي:** ✅ موجود بالفعل في الأدمن
**لا حاجة لتغيير** — `WhySection.tsx` يقرأ من admin settings بالفعل

### 4.4 STATS
**الوضع الحالي:** ✅ موجود بالفعل في الأدمن
**لا حاجة لتغيير** — `StatsSection.tsx` يقرأ من admin settings بالفعل

### 4.5 SKILLS_GRID
**الوضع الحالي:** معطّل في الكود (commented out)، لكن `skills` setting موجود في `PublicSettings`

**المطلوب:**
- إضافة UI في `SettingsTab.tsx` لإدارة `skills` (عنوان + لون لكل مهارة)

### 4.6 SUBJECTS
**الوضع الحالي:** ثابت في `constants.ts`، غير موجود في الأدمن

**المطلوب:** (تم تفصيله في المرحلة 2.2)

---

## المرحلة 5: Hero Section — استبدال الفيديوهات بفيديو/GIF/صور

### الوضع الحالي
- 3 فيديوهات مستوردة كـ static imports من `attached_assets/videos/`
- النصوص ثابتة في الكود
- `hero_slides` موجود في `PublicSettings` لكن للنصوص فقط

### المطلوب
- توسيع `hero_slides` setting ليدعم:
  ```typescript
  interface HeroSlide {
    title: string;
    highlight: string;
    subtitle: string;
    mediaType: "video" | "gif" | "image"; // نوع الوسائط
    mediaUrl?: string;        // URL الملف المرفوع (Cloudinary)
  }
  ```

### التغييرات

#### Backend — `routes.ts`:
- إضافة route جديد `POST /api/admin/upload-media` يقبل:
  - فيديوهات (mp4, webm)
  - GIFs
  - صور (jpeg, png, webp)
- الرفع إلى Cloudinary مع `resource_type: "auto"`

#### Frontend — `use-public-settings.ts`:
- تحديث `HeroSlide` interface لإضافة `mediaType` و `mediaUrl`

#### Frontend — `HeroSection.tsx`:
- تعديل المنطق ليدعم:
  - إذا كان `mediaType === "video"` → يعرض `<video>` tag
  - إذا كان `mediaType === "image"` أو `"gif"` → يعرض `<img>` tag
- الـ static imports تبقى كـ fallback إذا لم يوجد `mediaUrl`

#### Frontend — `SettingsTab.tsx`:
- إضافة قسم "شرائح الهيرو" مع:
  - تعديل النصوص لكل شريحة (موجود جزئياً)
  - رفع ملف وسائط (فيديو/GIF/صورة) لكل شريحة
  - اختيار نوع الوسائط
  - معاينة الوسائط المرفوعة
  - إمكانية إضافة/حذف شرائح

---

## المرحلة 6: تحسين أداء رفع وتحميل الوسائط

### المشكلة
تحميل الصور في الموقع بطيء بسبب عدم وجود ضغط/تحسين أثناء الرفع والتقديم.

### الحل المقترح — استراتيجية متعددة الطبقات

### 6.1 ضغط الصور أثناء الرفع (Server-Side)

#### تثبيت المكتبات:
```bash
npm install sharp
```

#### التغييرات في `routes.ts`:
- **قبل الرفع لـ Cloudinary:** استخدام `sharp` لضغط الصورة:
  ```typescript
  import sharp from 'sharp';
  
  // عند رفع صورة:
  const compressedBuffer = await sharp(file.buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })  // تحويل لـ WebP مع جودة 85%
    .toBuffer();
  ```
- **ملاحظة مهمة:** Cloudinary يقوم بالفعل بـ `quality: "auto"` و `fetch_format: "auto"` مما يعني أنه يقدم الصور بأفضل format حسب المتصفح (WebP/AVIF). لكن إضافة ضغط محلي قبل الرفع يقلل وقت الـ upload نفسه.

### 6.1.1 حذف الملفات القديمة من Cloudinary (عند الاستبدال)

**المشكلة:** عند رفع صورة جديدة مكان القديمة، الملف القديم البقى موجود في Cloudinary ويستهلك مساحة.

**الحل:** استخدام `public_id` ثابت لكل نوع محتوى بدلاً من `Date.now()` ليكون هناك ملف واحد فقط.

```typescript
// مثال للصورة gallery1:
cloudinary.uploader.upload_stream({
  resource_type: "image",
  folder: "abqary-uploads",
  public_id: "abqary-gallery1",  // ✅ ثابت — عند الرفع الجديد يستبدل القديم
  overwrite: true,               // ✅ تأكيد الاستبدال
  invalidate: true,              // ✅ تنظيف الكاش لـ CDN
  transformation: [
    { quality: "auto", fetch_format: "auto" }
  ]
})
```

**public_id لكل صورة:**
| الصورة | public_id |
|-------|-----------|
| mascot | `abqary-mascot` |
| instructor | `abqary-instructor` |
| gallery1 | `abqary-gallery1` |
| gallery2 | `abqary-gallery2` |
| gallery3 | `abqary-gallery3` |
| gallery4 | `abqary-gallery4` |
| upcoming_event_bg | `abqary-upcoming-event-bg` |
| hero_slide_1 | `abqary-hero-slide-1` |
| hero_slide_2 | `abqary-hero-slide-2` |
| hero_slide_3 | `abqary-hero-slide-3` |

**الفوائد:**
- ✅ لا يتراكم ملفات قديمة
- ✅ نفس الـ URL دائماً (لا حاجة لتحديث البيانات في DB)
- ✅ Cloudinary يحذف الإصدار القديم تلقائياً
- ✅ CDN cache ينظف نفسه بنفسه مع `invalidate: true`

**ملاحظة:** الفيديوهات نفس الاستراتيجية:
```typescript
public_id: "abqary-hero-video-1",  // بدلاً من استخدام Date.now()
```

### 6.2 ضغط الفيديو أثناء الرفع

#### الخيار المفضل — Cloudinary Eager Transformations:
```typescript
// عند رفع فيديو لـ Cloudinary:
cloudinary.uploader.upload_stream({
  resource_type: "video",
  folder: "abqary-videos",
  eager: [
    { format: "mp4", video_codec: "h265", quality: "auto:good" },
    { format: "webm", video_codec: "vp9", quality: "auto:good" }
  ],
  eager_async: true, // الضغط يتم في الخلفية
})
```

#### الخيار البديل — ضغط محلي بـ fluent-ffmpeg:
```bash
npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
```
- ضغط الفيديو قبل الرفع لتقليل حجم الـ upload
- **ملاحظة:** هذا يبطئ عملية الرفع نفسها لكن يقلل حجم البيانات المنقولة

### 6.3 تحسين تقديم الصور في الـ Frontend

#### Lazy Loading (موجود بالفعل):
- `loading="lazy"` موجود على معظم الصور ✅

#### Cloudinary URL Transformations — تقديم صور محسنة:
- إنشاء utility function لتحويل URL الصورة لإضافة transformations:
  ```typescript
  // lib/imageUtils.ts
  function optimizeCloudinaryUrl(url: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }): string {
    if (!url.includes('cloudinary.com')) return url;
    // إدراج transformations في الـ URL
    // مثال: /upload/w_800,h_600,q_auto,f_auto/
    const transforms = [];
    if (options?.width) transforms.push(`w_${options.width}`);
    if (options?.height) transforms.push(`h_${options.height}`);
    transforms.push('q_auto', 'f_auto');
    return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
  }
  ```
- استخدام هذه الدالة في كل مكان يعرض صورة من Cloudinary

#### Responsive Images:
- إضافة `srcSet` مع أحجام مختلفة للصور:
  ```tsx
  <img
    src={optimizeCloudinaryUrl(imageUrl, { width: 800 })}
    srcSet={`
      ${optimizeCloudinaryUrl(imageUrl, { width: 400 })} 400w,
      ${optimizeCloudinaryUrl(imageUrl, { width: 800 })} 800w,
      ${optimizeCloudinaryUrl(imageUrl, { width: 1200 })} 1200w
    `}
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  ```

### 6.4 تحسين تحميل الفيديوهات

#### Preload Strategy:
- الفيديو الأول: `preload="auto"` (موجود ✅)
- باقي الفيديوهات: `preload="none"` بدلاً من `"metadata"` لتقليل التحميل الأولي

#### Cloudinary Video Delivery:
- استخدام adaptive bitrate streaming:
  ```typescript
  // تقديم الفيديو بحسب سرعة الاتصال
  const videoUrl = url.replace('/upload/', '/upload/q_auto,f_auto/');
  ```

### 6.5 ملاحظة مهمة عن "فك الضغط"
> **المطلوب:** "ترفع مضغوطة وترجع بجودتها الأصلية"

**الواقع التقني:** لا يمكن استعادة الجودة المفقودة من الضغط (lossy compression). لكن الاستراتيجية الصحيحة:
1. **عند الرفع:** نحفظ النسخة الأصلية (original) في Cloudinary
2. **أثناء النقل (Upload):** نضغط البيانات فقط أثناء إرسالها للسيرفر باستخدام gzip/brotli (ضغط transport layer)
3. **عند التقديم (Serving):** Cloudinary يقدم الصورة بأفضل جودة ممكنة مع ضغط ذكي حسب المتصفح

**التنفيذ:**
```typescript
// في routes.ts — تفعيل ضغط الـ response
import compression from 'compression';
app.use(compression()); // يضغط كل الـ responses بـ gzip/brotli
```

---

## المرحلة 7: تحديث ImageData و IMAGE_LABELS

### الوضع الحالي
`ImageData` في admin constants تدعم فقط: `mascot`, `instructor`, `gallery1`, `gallery2`

### المطلوب
- توسيع `ImageData` لتشمل: `gallery3`, `gallery4`, `upcoming_event_bg`, `hero_slide_1`, `hero_slide_2`, `hero_slide_3`
- تحديث `IMAGE_LABELS` بالأسماء العربية
- تحديث `IMAGE_FALLBACKS` بالصور الافتراضية
- تحديث `sanitizeImages` في `use-public-settings.ts` لتشمل المفاتيح الجديدة

---

## ملخص الملفات المتأثرة

### ملفات Backend (تغييرات محدودة):
| الملف | التغيير |
|-------|---------|
| `api/server/routes.ts` | إضافة route لرفع الوسائط (video/gif) + ضغط الصور بـ `sharp` |
| `package.json` | إضافة `sharp` و `compression` |

### ملفات Frontend — Components:
| الملف | التغيير |
|-------|---------|
| `GallerySection.tsx` | قراءة `gallery_cards` و `upcoming_event` من الأدمن |
| `SkillsSection.tsx` | قراءة `skills_cards` و `subjects` من الأدمن |
| `EmpowerSection.tsx` | قراءة `empower_section` من الأدمن |
| `HeroSection.tsx` | دعم وسائط ديناميكية (فيديو/GIF/صورة) من الأدمن |

### ملفات Frontend — Admin:
| الملف | التغيير |
|-------|---------|
| `SettingsTab.tsx` | إضافة أقسام: الفعالية القادمة، بطاقات المعرض، بطاقات المهارات، المواد، قسم التمكين، إعدادات الموقع، شرائح الهيرو |
| `admin/settings/constants.ts` | توسيع `ImageData`, `IMAGE_LABELS`, `IMAGE_FALLBACKS` |

### ملفات Frontend — Hooks & Utils:
| الملف | التغيير |
|-------|---------|
| `use-public-settings.ts` | إضافة interfaces جديدة وتحديث `PublicSettings` |
| `lib/imageUtils.ts` (جديد) | دالة `optimizeCloudinaryUrl` لتحسين URLs الصور |

---

## ترتيب التنفيذ المقترح

```
المرحلة 1 → GallerySection (فعالية قادمة + بطاقات المعرض)
المرحلة 2 → SkillsSection (بطاقات المهارات + المواد + شبكة المهارات)
المرحلة 3 → EmpowerSection (النصوص والأرقام)
المرحلة 4 → Constants (SITE_CONFIG UI + SUBJECTS)
المرحلة 5 → HeroSection (استبدال الفيديوهات)
المرحلة 6 → تحسين الأداء (sharp + compression + Cloudinary optimizations)
المرحلة 7 → تحديث ImageData و sanitization
```

**كل مرحلة تشمل:** تحديث `PublicSettings` → تحديث الـ Section → إضافة UI في Admin → اختبار

---

## ملاحظات مهمة

1. **الـ Backend لا يحتاج تغييرات كبيرة** — نظام `SiteSetting` (key-value) مرن ويدعم أي بنية بيانات
2. **Cloudinary هو الحل الأساسي** — لا حاجة لتخزين محلي، Cloudinary يتعامل مع الضغط والتحسين والتقديم
3. **Fallback دائماً** — كل section يجب أن يعمل بالقيم الافتراضية إذا لم يحفظ الأدمن بيانات
4. **لا كسر للموجود** — كل التغييرات additive ولا تكسر الوظائف الحالية
5. **gallery3 و gallery4** — الصور موجودة بالفعل في نظام الصور لكن غير مضافة في `IMAGE_LABELS` في الأدمن، يجب إضافتها
