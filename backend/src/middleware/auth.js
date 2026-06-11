const jwt = require('jsonwebtoken');

// Xodim (admin/kassir) himoyasi — mijoz tokenini rad etadi
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ xato: 'Token kerak' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tur === 'mijoz') {
      return res.status(403).json({ xato: 'Bu sahifa faqat xodimlar uchun' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ xato: 'Token noto\'g\'ri' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ xato: 'Faqat admin uchun' });
  }
  next();
}

// Mijoz himoyasi — faqat mijoz tokeni
function mijozAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ xato: 'Kirish kerak' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tur !== 'mijoz') {
      return res.status(403).json({ xato: 'Mijoz hisobi kerak' });
    }
    req.mijoz = decoded;
    next();
  } catch {
    res.status(401).json({ xato: 'Token noto\'g\'ri' });
  }
}

// Ixtiyoriy mijoz — token bo'lsa req.mijoz, bo'lmasa ham davom etadi
function mijozIxtiyoriy(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.tur === 'mijoz') req.mijoz = decoded;
    } catch {
      // yaroqsiz token — mehmon sifatida davom etadi
    }
  }
  next();
}

module.exports = { authMiddleware, adminOnly, mijozAuth, mijozIxtiyoriy };
