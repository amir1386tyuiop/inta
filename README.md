# اینتا (Inta) - پلتفرم خدمات حقوقی هوشمند

پلتفرم جامع خدمات حقوقی با قابلیت هوش مصنوعی برای تحلیل پرونده، تحلیل حکم، پردازش تصویر اسناد و مشاوره حقوقی.

## تکنولوژی‌ها

- **Backend**: Node.js + Express.js
- **Database**: SQLite (توسعه) / PostgreSQL (پروداکشن) با Prisma ORM
- **AI**: OpenRouter API (Gemini, GPT, Claude و...)
- **Auth**: JWT
- **Scheduler**: node-cron

## قابلیت‌ها

### هوش مصنوعی
- چت هوشمند حقوقی با دسترسی به داده‌های سایت
- تحلیل پرونده (Case Analysis)
- تحلیل حکم (Verdict Analysis)
- پردازش تصویر اسناد حقوقی (OCR + تحلیل)
- سرچ کنسول هوشمند

### مدیریت پرونده
- ایجاد و مدیریت پرونده‌ها
- آپلود اسناد و تصاویر
- ثبت احکام قضایی
- اختصاص وکیل به پرونده

### تقویم دادگاه
- تقویم جلسات دادگاه
- نوتیفیکیشن روزانه خودکار
- نمایش جزئیات کامل پرونده در نوتیفیکیشن

### وکلا
- جستجوی وکیل بر اساس تخصص، شهر و تجربه
- پروفایل وکلا با سیستم تأیید

### وبلاگ
- مقالات حقوقی با دسته‌بندی
- جستجو در مقالات

### تماس با ما
- فرم تماس با قابلیت پاسخ‌دهی

## نصب و راه‌اندازی

```bash
# نصب وابستگی‌ها
npm install

# کپی فایل تنظیمات
cp .env.example .env

# ایجاد دیتابیس و جداول
npx prisma db push

# تولید Prisma Client
npx prisma generate

# اضافه کردن داده‌های نمونه
npm run db:seed

# اجرا در حالت توسعه
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - ثبت‌نام
- `POST /api/auth/login` - ورود
- `GET /api/auth/me` - پروفایل
- `PUT /api/auth/me` - ویرایش پروفایل

### AI
- `POST /api/ai/chat` - چت با هوش مصنوعی
- `GET /api/ai/sessions` - لیست جلسات چت
- `GET /api/ai/sessions/:id` - پیام‌های جلسه
- `POST /api/ai/search` - جستجوی هوشمند

### Cases
- `GET /api/cases` - لیست پرونده‌ها
- `GET /api/cases/:id` - جزئیات پرونده
- `POST /api/cases` - ایجاد پرونده
- `PUT /api/cases/:id` - ویرایش
- `POST /api/cases/:id/analyze` - تحلیل AI
- `POST /api/cases/:id/summarize` - خلاصه AI
- `PATCH /api/cases/:id/assign-lawyer` - اختصاص وکیل

### Verdicts
- `GET /api/verdicts/case/:caseId` - احکام پرونده
- `POST /api/verdicts` - ثبت حکم
- `POST /api/verdicts/:id/analyze` - تحلیل حکم با AI

### Documents
- `POST /api/documents/upload` - آپلود سند/تصویر
- `GET /api/documents/case/:caseId` - اسناد پرونده
- `POST /api/documents/:id/analyze` - تحلیل تصویر با AI

### Calendar
- `GET /api/calendar` - تقویم
- `GET /api/calendar/today` - رویدادهای امروز
- `GET /api/calendar/range?from=&to=` - بازه زمانی
- `POST /api/calendar` - ایجاد رویداد

### Notifications
- `GET /api/notifications` - نوتیفیکیشن‌ها
- `GET /api/notifications/unread-count` - تعداد خوانده‌نشده
- `GET /api/notifications/:id` - جزئیات (شامل اطلاعات کامل پرونده)
- `PATCH /api/notifications/:id/read` - خواندن

### Blog
- `GET /api/blog` - لیست مقالات
- `GET /api/blog/:slug` - مقاله
- `POST /api/blog` - ایجاد (ادمین)

### Contact
- `POST /api/contact` - ارسال پیام
- `GET /api/contact` - لیست (ادمین)

### Search
- `GET /api/search?q=` - جستجوی سراسری

### Lawyers
- `GET /api/lawyers` - جستجوی وکیل
- `GET /api/lawyers/:id` - پروفایل وکیل
- `POST /api/lawyers/profile` - ایجاد پروفایل وکالت

## متغیرهای محیطی

| متغیر | توضیحات |
|--------|---------|
| `PORT` | پورت سرور (پیش‌فرض: 3000) |
| `DATABASE_URL` | آدرس دیتابیس |
| `JWT_SECRET` | کلید رمزنگاری JWT |
| `OPENROUTER_API_KEY` | کلید API اوپن‌روتر |
| `OPENROUTER_MODEL` | مدل AI پیش‌فرض |
| `ALLOWED_ORIGINS` | دامنه‌های مجاز CORS |
