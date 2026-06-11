# Saodat Restoran — Ishga tushirish ko'rsatmasi

## 1. PostgreSQL o'rnatish (bir marta)

**Variant A: Windows uchun PostgreSQL o'rnatish**
1. https://www.postgresql.org/download/windows/ dan yuklab oling
2. O'rnatishda: parol = `password`, port = `5432`
3. pgAdmin orqali `saodat_db` nomli baza yarating

**Variant B: Docker Desktop orqali (Docker o'rnatilgan bo'lsa)**
```
docker run -d --name saodat-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=saodat_db -p 5432:5432 postgres:15-alpine
```

---

## 2. Backend sozlash

```bash
cd backend

# .env faylida DATABASE_URL to'g'ri ekanini tekshiring:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/saodat_db"

# Ma'lumotlar bazasi jadvallari yaratish:
npx prisma migrate dev --name init

# Test ma'lumotlar yuklash:
node prisma/seed.js

# Serverni ishga tushirish:
npm run dev
```

Server: http://localhost:5000

---

## 3. Frontend ishga tushirish

```bash
cd frontend
npm run dev
```

Sayt: http://localhost:5173

---

## 4. Kirish ma'lumotlari

- **Admin panel**: http://localhost:5173/admin
  - Login: `admin` | Parol: `admin123`

- **Kassir paneli**: http://localhost:5173/kassir
  - Login: `kassir` | Parol: `kassir123`

- **Mijoz menyu**: http://localhost:5173/

---

## 5. Sahifalar

| Sahifa | Manzil |
|--------|--------|
| Menyu | `/` |
| Buyurtma berish | `/buyurtma` |
| Buyurtma holati | `/buyurtma/:raqam` |
| Kassir paneli | `/kassir` |
| Admin paneli | `/admin` |
| Mahsulot qo'shish | `/admin/mahsulot/yangi` |
| Kirish | `/login` |
