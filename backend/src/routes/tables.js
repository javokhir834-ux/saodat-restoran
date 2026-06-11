const router = require('express').Router();
const prisma = require('../prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// GET /api/tables — barcha stollar (ochiq)
router.get('/', async (req, res) => {
  const tables = await prisma.restaurantTable.findMany({
    orderBy: { raqam: 'asc' },
  });
  res.json(tables);
});

// GET /api/tables/:id
router.get('/:id', async (req, res) => {
  const table = await prisma.restaurantTable.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!table) return res.status(404).json({ xato: 'Topilmadi' });
  res.json(table);
});

// POST /api/tables — yangi stol (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { raqam, nom, sigim } = req.body;

  const table = await prisma.restaurantTable.create({
    data: { raqam: Number(raqam), nom, sigim: sigim ? Number(sigim) : 4 },
  });

  // QR kod yaratish — mijoz menyuga tushadi, stol raqami avtomatik biriktiriladi
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const qrUrl = `${frontendUrl}/?stol=${table.raqam}`;
  const qrDir = path.join(__dirname, '../uploads/qr');
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
  const qrFile = path.join(qrDir, `table_${table.id}.png`);
  await QRCode.toFile(qrFile, qrUrl);

  const updated = await prisma.restaurantTable.update({
    where: { id: table.id },
    data: { qrKodUrl: `/uploads/qr/table_${table.id}.png` },
  });
  res.status(201).json(updated);
});

// DELETE /api/tables/:id (admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await prisma.restaurantTable.delete({ where: { id: Number(req.params.id) } });
  res.json({ xabar: 'O\'chirildi' });
});

module.exports = router;
