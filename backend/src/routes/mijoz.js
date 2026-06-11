/*
 * Saodat Restoran — mijoz hisoblari (ro'yxat, email tasdiqlash, kirish, profil)
 * Muallif: Ibrayimov Javohir
 *
 * Ro'yxatdan o'tish ikki bosqichli:
 *   1) /kod-yubor  — ma'lumotlarni tekshiramiz va emailga 6 xonali kod yuboramiz
 *   2) /tasdiqla   — kod to'g'ri bo'lsa hisob yaratiladi va token beriladi
 * Tasdiqlanmagan ma'lumot bazaga yozilmaydi — xotirada vaqtincha turadi.
 */
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const asyncHandler = require('../middleware/asyncHandler');
const { mijozAuth } = require('../middleware/auth');
const { tasdiqKodYubor, emailSozlanganmi } = require('../mailer');

// Tasdiq kutayotgan ro'yxatlar: email → { ism, telefon, email, parolHash, kod, muddat, urinish }
const KUTAYOTGANLAR = new Map();
const KOD_MUDDATI = 10 * 60 * 1000; // 10 daqiqa
const MAX_URINISH = 5;

function kodYarat() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 xonali
}
function telefonTozala(t) {
  return (t || '').replace(/[^\d]/g, '');
}
function tokenYarat(mijoz) {
  return jwt.sign(
    { id: mijoz.id, tur: 'mijoz', ism: mijoz.ism, telefon: mijoz.telefon },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}
function mijozChiqar(m) {
  return { id: m.id, ism: m.ism, telefon: m.telefon, email: m.email, ballar: m.ballar };
}

// Eskirgan kutayotgan yozuvlarni tozalab turamiz
setInterval(() => {
  const hozir = Date.now();
  for (const [email, v] of KUTAYOTGANLAR) if (v.muddat < hozir) KUTAYOTGANLAR.delete(email);
}, 5 * 60 * 1000).unref?.();

// POST /api/mijoz/kod-yubor — 1-bosqich: tekshirish + emailga kod
router.post('/kod-yubor', asyncHandler(async (req, res) => {
  const ism = req.body.ism?.trim();
  const telefon = telefonTozala(req.body.telefon);
  const email = req.body.email?.trim().toLowerCase();
  const parol = req.body.parol;

  if (!ism || ism.length < 2) return res.status(400).json({ xato: 'Ismingizni kiriting' });
  if (telefon.length < 9) return res.status(400).json({ xato: "Telefon raqami noto'g'ri" });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ xato: "Email noto'g'ri" });
  if (!parol || parol.length < 4) return res.status(400).json({ xato: "Parol kamida 4 ta belgi bo'lsin" });

  // Allaqachon ro'yxatdan o'tganmi?
  const mavjud = await prisma.customer.findFirst({ where: { OR: [{ telefon }, { email }] } });
  if (mavjud) return res.status(409).json({ xato: "Bu telefon yoki email allaqachon ro'yxatdan o'tgan" });

  const kod = kodYarat();
  KUTAYOTGANLAR.set(email, {
    ism, telefon, email,
    parolHash: await bcrypt.hash(parol, 10),
    kod, muddat: Date.now() + KOD_MUDDATI, urinish: 0,
  });

  const yuborildi = await tasdiqKodYubor(email, ism, kod);
  res.json({
    xabar: yuborildi ? 'Tasdiqlash kodi emailingizga yuborildi' : 'Kod yaratildi (dev rejim)',
    email,
    yuborildi,
    // Email sozlanmagan bo'lsa — sinab ko'rish uchun kodni qaytaramiz
    ...(emailSozlanganmi() ? {} : { devKod: kod }),
  });
}));

// POST /api/mijoz/kod-qayta — kodni qayta yuborish
router.post('/kod-qayta', asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const kutayotgan = email && KUTAYOTGANLAR.get(email);
  if (!kutayotgan) return res.status(404).json({ xato: 'Avval ma\'lumotlarni kiriting' });

  kutayotgan.kod = kodYarat();
  kutayotgan.muddat = Date.now() + KOD_MUDDATI;
  kutayotgan.urinish = 0;
  const yuborildi = await tasdiqKodYubor(email, kutayotgan.ism, kutayotgan.kod);
  res.json({ xabar: 'Kod qayta yuborildi', yuborildi, ...(emailSozlanganmi() ? {} : { devKod: kutayotgan.kod }) });
}));

// POST /api/mijoz/tasdiqla — 2-bosqich: kodni tekshirish + hisob yaratish
router.post('/tasdiqla', asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const kod = String(req.body.kod || '').trim();

  const kutayotgan = email && KUTAYOTGANLAR.get(email);
  if (!kutayotgan) return res.status(400).json({ xato: 'Kod muddati tugagan — qaytadan boshlang' });
  if (kutayotgan.muddat < Date.now()) { KUTAYOTGANLAR.delete(email); return res.status(400).json({ xato: 'Kod muddati tugadi' }); }
  if (kutayotgan.urinish >= MAX_URINISH) { KUTAYOTGANLAR.delete(email); return res.status(429).json({ xato: 'Juda ko\'p urinish — qaytadan boshlang' }); }

  if (kod !== kutayotgan.kod) {
    kutayotgan.urinish++;
    return res.status(400).json({ xato: `Kod noto'g'ri (${MAX_URINISH - kutayotgan.urinish} urinish qoldi)` });
  }

  // Kod to'g'ri — hisob yaratamiz
  const mijoz = await prisma.customer.create({
    data: {
      ism: kutayotgan.ism, telefon: kutayotgan.telefon, email: kutayotgan.email,
      parolHash: kutayotgan.parolHash, emailTasdiqlandi: true,
    },
  });
  KUTAYOTGANLAR.delete(email);

  res.status(201).json({ token: tokenYarat(mijoz), mijoz: mijozChiqar(mijoz) });
}));

// POST /api/mijoz/kirish — telefon yoki email + parol
router.post('/kirish', asyncHandler(async (req, res) => {
  const login = (req.body.login || '').trim();
  const parol = req.body.parol;
  if (!login || !parol) return res.status(400).json({ xato: 'Login va parol kerak' });

  const email = login.toLowerCase();
  const telefon = telefonTozala(login);
  const mijoz = await prisma.customer.findFirst({
    where: { OR: [{ email }, ...(telefon.length >= 9 ? [{ telefon }] : [])] },
  });
  if (!mijoz) return res.status(401).json({ xato: "Login yoki parol noto'g'ri" });

  const togri = await bcrypt.compare(parol, mijoz.parolHash);
  if (!togri) return res.status(401).json({ xato: "Login yoki parol noto'g'ri" });

  res.json({ token: tokenYarat(mijoz), mijoz: mijozChiqar(mijoz) });
}));

// GET /api/mijoz/men — profil
router.get('/men', mijozAuth, asyncHandler(async (req, res) => {
  const mijoz = await prisma.customer.findUnique({ where: { id: req.mijoz.id } });
  if (!mijoz) return res.status(404).json({ xato: 'Hisob topilmadi' });
  res.json(mijozChiqar(mijoz));
}));

// GET /api/mijoz/buyurtmalar — buyurtmalar tarixi
router.get('/buyurtmalar', mijozAuth, asyncHandler(async (req, res) => {
  const buyurtmalar = await prisma.order.findMany({
    where: { customerId: req.mijoz.id },
    include: { items: true, table: true },
    orderBy: { yaratilganVaqt: 'desc' },
    take: 50,
  });
  res.json(buyurtmalar);
}));

module.exports = router;
