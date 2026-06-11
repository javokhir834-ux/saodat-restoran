const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const asyncHandler = require('../middleware/asyncHandler');

// Oddiy in-memory rate limiter (production'da Redis ishlatish kerak)
const URINISHLAR = new Map(); // login → { soni, birinchi }
const MAX_URINISH = 10;
const OYNA_MS = 15 * 60 * 1000; // 15 daqiqa

function rateLimitTekshir(login) {
  const hozir = Date.now();
  const holat = URINISHLAR.get(login);
  if (!holat || hozir - holat.birinchi > OYNA_MS) {
    URINISHLAR.set(login, { soni: 1, birinchi: hozir });
    return true;
  }
  if (holat.soni >= MAX_URINISH) return false;
  holat.soni++;
  return true;
}

function rateLimitTozala(login) {
  URINISHLAR.delete(login);
}

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { login, parol } = req.body;
  if (!login?.trim() || !parol) {
    return res.status(400).json({ xato: 'Login va parol kerak' });
  }

  if (!rateLimitTekshir(login.toLowerCase())) {
    return res.status(429).json({ xato: 'Juda ko\'p urinish. 15 daqiqadan keyin qaytib urinib ko\'ring.' });
  }

  const user = await prisma.adminUser.findUnique({ where: { login: login.trim() } });
  if (!user) {
    return res.status(401).json({ xato: "Login yoki parol noto'g'ri" });
  }

  const togri = await bcrypt.compare(parol, user.parolHash);
  if (!togri) {
    return res.status(401).json({ xato: "Login yoki parol noto'g'ri" });
  }

  rateLimitTozala(login.toLowerCase());

  const token = jwt.sign(
    { id: user.id, login: user.login, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({ token, user: { id: user.id, login: user.login, rol: user.rol } });
}));

module.exports = router;
