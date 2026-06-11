# Saodat Restoran — internetga joylashtirish (Render.com)

> Muallif: Ibrayimov Javohir
> Bu qo'llanma saytni bepul **Render.com** xizmatiga qo'yishni qadam-baqadam ko'rsatadi.
> Frontend va backend bitta serverdan beriladi, PostgreSQL ham Render'da turadi.

---

## 0. Nima kerak
- GitHub hisobi (bepul)
- Render.com hisobi (bepul) — GitHub bilan kirsa bo'ladi
- Bu loyiha papkasi

---

## 1. Loyihani GitHub'ga yuklash

Loyiha papkasida (terminal/PowerShell):

```bash
git init
git add .
git commit -m "Saodat Restoran — boshlang'ich versiya"
```

So'ng GitHub'da yangi **bo'sh** repozitoriy oching (masalan `saodat-restoran`), keyin:

```bash
git remote add origin https://github.com/FOYDALANUVCHI/saodat-restoran.git
git branch -M main
git push -u origin main
```

> `.env`, `node_modules`, `dist` git'ga tushmaydi — `.gitignore` ularni chetga chiqaradi.

---

## 2. Render'da deploy qilish (eng oson yo'l — Blueprint)

1. https://dashboard.render.com → **New +** → **Blueprint**
2. GitHub repozitoriyangizni tanlang
3. Render `render.yaml` faylni o'qiydi va ikkita narsani yaratadi:
   - **saodat-restoran** (web servis, Docker)
   - **saodat-db** (PostgreSQL, bepul)
4. **Apply** bosing. Render avtomatik:
   - `JWT_SECRET` yaratadi
   - `DATABASE_URL` ni bazaga ulaydi
   - Docker image'ni quradi va `prisma migrate deploy` ni ishga tushiradi
5. 3–5 daqiqada tayyor. Manzil: `https://saodat-restoran.onrender.com`

---

## 3. Birinchi marta — bazani to'ldirish (seed)

Migratsiya jadvallarni yaratadi, lekin menyu bo'sh bo'ladi. Bir marta to'ldirish kerak:

- Render → **saodat-restoran** servisi → **Shell** bo'limi → quyidagini yozing:

```bash
node prisma/seed.js
node prisma/kg-mahsulotlar.js
```

Bu admin/kassir va menyu (kg mahsulotlar bilan) qo'shadi.

---

## 4. Kirish ma'lumotlari (deploydan keyin)
- Mijoz: saytda **Kirish → Ro'yxatdan o'tish** (emailga kod — hozir dev rejim, kod konsolda)
- Admin: `/login` → `admin` / `admin123`
- Kassir: `/login` → `kassir` / `kassir123`

> ⚠️ Ishlab chiqarishda admin/kassir parollarini almashtiring (seed.js ichida yoki bazada).

---

## 5. Gmail kodni haqiqiy yuborish (keyinroq, ixtiyoriy)
Render → servis → **Environment** → qo'shing:
- `GMAIL_USER` = pochtangiz@gmail.com
- `GMAIL_APP_PASSWORD` = Google "App Password" (16 belgili)

Google'da: hisob → Xavfsizlik → 2-bosqichli tasdiq (yoqilgan bo'lsin) → "App passwords".

---

## Eslatma — Railway bilan ham bo'ladi
Railway.app'da: New Project → Deploy from GitHub → PostgreSQL plugin qo'shing →
`DATABASE_URL` ni ulang. Dockerfile avtomatik ishlatiladi. Start: `npx prisma migrate deploy && node server.js`.

---

## Bepul reja cheklovi
Render bepul web servis 15 daqiqa harakatsizlikdan keyin "uxlaydi" — birinchi so'rov 30–50 soniya sekin bo'ladi. Doimiy tezlik uchun pullik reja ($7/oy) yoki Railway kerak.
