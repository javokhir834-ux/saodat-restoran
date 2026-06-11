const router = require('express').Router();
const prisma = require('../prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Faqat rasm fayllari qabul qilinadi'));
  },
});

function rasmOchir(rasmUrl) {
  if (!rasmUrl || rasmUrl.startsWith('http')) return; // tashqi URL — o'chirma
  try {
    const filePath = path.join(__dirname, '../..', rasmUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Fayl allaqachon yo'q bo'lishi mumkin — ignore
  }
}

// GET /api/products — barcha mahsulotlar (ochiq)
router.get('/', asyncHandler(async (req, res) => {
  const { categoryId, qidiruv } = req.query;
  const where = { faol: true };
  if (categoryId) where.categoryId = Number(categoryId);
  if (qidiruv) where.nom = { contains: qidiruv, mode: 'insensitive' };

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { nom: 'asc' },
  });
  res.json(products);
}));

// GET /api/products/mashhur
router.get('/mashhur', asyncHandler(async (req, res) => {
  const items = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { miqdori: true },
    orderBy: { _sum: { miqdori: 'desc' } },
    take: 8,
  });
  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, faol: true },
    include: { category: true },
  });
  res.json(products);
}));

// GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true },
  });
  if (!product) return res.status(404).json({ xato: 'Topilmadi' });
  res.json(product);
}));

// POST /api/products — yangi mahsulot (admin)
router.post('/', authMiddleware, adminOnly, upload.single('rasm'), asyncHandler(async (req, res) => {
  const { categoryId, nom, tavsif, narx, birlik, tur, qadam, qoldiq } = req.body;
  if (!categoryId || !nom?.trim() || !narx) {
    if (req.file) rasmOchir(`/uploads/${req.file.filename}`);
    return res.status(400).json({ xato: "Kategoriya, nom va narx majburiy" });
  }
  const rasmUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const product = await prisma.product.create({
    data: {
      categoryId: Number(categoryId),
      nom: nom.trim(),
      tavsif: tavsif?.trim() || null,
      narx: parseFloat(narx),
      rasmUrl,
      birlik: birlik || 'porsiya',
      tur: tur || 'whole',
      qadam: qadam ? parseFloat(qadam) : 1,
      qoldiq: qoldiq !== undefined && qoldiq !== '' ? parseFloat(qoldiq) : null,
    },
  });
  res.status(201).json(product);
}));

// PUT /api/products/:id — tahrirlash (admin)
router.put('/:id', authMiddleware, adminOnly, upload.single('rasm'), asyncHandler(async (req, res) => {
  const { nom, tavsif, narx, birlik, tur, qadam, qoldiq, faol, categoryId } = req.body;
  const data = {};
  if (nom !== undefined) data.nom = nom.trim();
  if (tavsif !== undefined) data.tavsif = tavsif?.trim() || null;
  if (birlik !== undefined) data.birlik = birlik;
  if (tur !== undefined) data.tur = tur;
  if (narx !== undefined) data.narx = parseFloat(narx);
  if (qadam !== undefined) data.qadam = parseFloat(qadam);
  if (qoldiq !== undefined) data.qoldiq = qoldiq !== '' ? parseFloat(qoldiq) : null;
  if (faol !== undefined) data.faol = faol === 'true' || faol === true;
  if (categoryId) data.categoryId = Number(categoryId);

  if (req.file) {
    // Eski rasmni diskdan o'chirish
    const eski = await prisma.product.findUnique({ where: { id: Number(req.params.id) }, select: { rasmUrl: true } });
    if (eski?.rasmUrl) rasmOchir(eski.rasmUrl);
    data.rasmUrl = `/uploads/${req.file.filename}`;
  }

  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data,
  });
  res.json(product);
}));

// PATCH /api/products/:id/qoldiq — qoldiq yangilash (admin/kassir)
router.patch('/:id/qoldiq', authMiddleware, asyncHandler(async (req, res) => {
  const { qoldiq } = req.body;
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { qoldiq: qoldiq !== null && qoldiq !== '' ? parseFloat(qoldiq) : null },
  });
  res.json(product);
}));

// DELETE /api/products/:id — soft delete (admin)
router.delete('/:id', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    select: { rasmUrl: true },
  });
  if (!product) return res.status(404).json({ xato: 'Topilmadi' });

  await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { faol: false },
  });
  res.json({ xabar: "O'chirildi" });
}));

// Multer xato ushlagichi
router.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ xato: "Rasm 5 MB dan katta bo'lmasin" });
  if (err?.message) return res.status(400).json({ xato: err.message });
  next(err);
});

module.exports = router;
