
# 🧠 بک‌اند وب‌سایت کلاس زبان

## 📍 درباره پروژه

**بک‌اند وب‌سایت کلاس زبان** یک پروژه قدرتمند Node.js بر پایه Express است که APIهای کامل و امنی برای مدیریت سایت آموزش زبان ارائه می‌دهد. این پروژه از پایگاه داده MySQL و Redis استفاده می‌کند و دارای سیستم احراز هویت مدرن شامل OTP، Captcha، AccessToken و RefreshToken است. همچنین امکان بارگذاری فایل، ارسال ایمیل، مدیریت کاربران، دوره‌ها، نظرات، تیکت‌ها و... را فراهم می‌کند.

---

## ✨ ویژگی‌ها

- احراز هویت با OTP و Captcha
- استفاده از AccessToken و RefreshToken برای مدیریت نشست کاربر
- بارگذاری و ذخیره تصاویر و فایل‌ها
- ارسال ایمیل با Nodemailer
- سیستم مدیریت کاربران، مقالات، دوره‌ها، تگ‌ها و...
- تعامل با دو بخش فرانت‌اند:
  - [english-userSide](https://github.com/Mohsen-moosavi/English-userSide)
  - [english-adminpanel](https://github.com/Mohsen-moosavi/english-adminpanel)

---

## 🛠 تکنولوژی‌ها و ابزارهای استفاده شده

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-FFCA28?style=flat&logoColor=black)
![Dotenv](https://img.shields.io/badge/Dotenv-ECD53F?style=flat)
![BcryptJS](https://img.shields.io/badge/BcryptJS-8B4513?style=flat)
![Nodemailer](https://img.shields.io/badge/Nodemailer-3C3C3C?style=flat)
![Cookie-Parser](https://img.shields.io/badge/Cookie--Parser-ffa726?style=flat)
![CORS](https://img.shields.io/badge/CORS-4caf50?style=flat)
![Slugify](https://img.shields.io/badge/Slugify-607d8b?style=flat)
![SVG Captcha](https://img.shields.io/badge/SVG--Captcha-9c27b0?style=flat)

---

## ⚙️ راه‌اندازی پروژه

### پیش‌نیازها

- نصب Node.js (ورژن 16 یا بالاتر)
- نصب و راه‌اندازی MySQL
- نصب Redis

### مراحل نصب

1. دریافت کد پروژه:

```bash
git clone https://github.com/Mohsen-moosavi/english-backend.git
cd english-backend
```

2. نصب وابستگی‌ها:

```bash
npm install
```

3. تنظیم فایل `.env` با محتویات زیر:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=english_db
DB_USERNAME=root
DB_PASSWORD=your_password

REDIS_URI=redis://localhost:6379

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

OTP_EMAIL_USER=your_email@example.com
OTP_EMAIL_PASS=your_email_password
```

> ⚠️ برای REDIS_URI اگر Redis را لوکال نصب کرده‌اید، معمولاً مقدار `redis://localhost:6379` کافی است. اگر روی سرور مجازی نصب شده، آدرس IP سرور Redis را جایگزین کنید.

4. اجرای ساخت دیتابیس و جداول:

```bash
npm run db         # ساخت دیتابیس
npm run migrate    # ساخت جداول
npm run seeder     # افزودن داده‌های اولیه
```

5. اجرای پروژه:

```bash
npm run dev
```

---

## 📁 فایل Postman

یک فایل Postman برای تست API‌ها در مخزن پروژه قرار دارد. می‌توانید آن را import کرده و همه مسیرهای API را بررسی و تست کنید.

---

## 🔗 لینک‌های مرتبط

- 🌐 فرانت کاربری: [english-userSide](https://github.com/Mohsen-moosavi/English-userSide)
- 🛠 پنل ادمین: [english-adminpanel](https://github.com/Mohsen-moosavi/english-adminpanel)
- 📁 گیت‌هاب این پروژه: [english-backend](https://github.com/Mohsen-moosavi/english-backend)

---

## 👨‍💻 توسعه‌دهنده

پروژه‌ای شخصی و نمونه‌کار از [محسن موسوی](https://github.com/Mohsen-moosavi)
