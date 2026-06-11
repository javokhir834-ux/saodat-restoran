const router = require('express').Router();
const prisma = require('../prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/categories — barcha kategoriyalar va mahsulotlari (ochiq)
router.get('/', asyncHandler(async (req, res) => {
  const kategoriyalar = await prisma.category.findMany({
    where: { faol: true },
    include: {
      products: {
        where: { faol: true },
        orderBy: { nom: 'asc' },
      },
    },
    orderBy: { tartib: 'asc' },
  });
  res.json(kategoriyalar);
}));

// POST /api/categories (admin)
router.post('/', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
  const { nom, tartib } = req.body;
  if (!nom?.trim()) return res.status(400).json({ xato: 'Nom majburiy' });
  const kat = await prisma.category.create({
    data: { nom: nom.trim(), tartib: tartib ? Number(tartib) : 0 },
  });
  res.status(201).json(kat);
}));

// PUT /api/categories/:id (admin)
router.put('/:id', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
  const { nom, tartib, faol } = req.body;
  const kat = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { nom: nom?.trim(), tartib: tartib !== undefined ? Number(tartib) : undefined, faol },
  });
  res.json(kat);
}));

// DELETE /api/categories/:id (admin) — mahsulotlar bo'lsa oldini oladi
router.delete('/:id', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
  const mahsulotSoni = await prisma.product.count({
    where: { categoryId: Number(req.params.id), faol: true },
  });
  if (mahsulotSoni > 0) {
    return res.status(400).json({ xato: `Bu kategoriyada ${mahsulotSoni} ta faol mahsulot bor. Avval mahsulotlarni o'tkazing.` });
  }
  await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { faol: false },
  });
  res.json({ xabar: "O'chirildi" });
}));

module.exports = router;
