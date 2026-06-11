const router = require('express').Router();
const prisma = require('../prisma');
const { authMiddleware } = require('../middleware/auth');

const BRON_HOLATLAR = ['yangi', 'tasdiqlandi', 'rad'];

// POST /api/bookings — stol bron (ochiq)
router.post('/', async (req, res) => {
  const { tableId, mijozIsmi, telefon, sana, vaqt, kishiSoni, izoh } = req.body;

  if (!mijozIsmi?.trim() || !telefon?.trim() || !sana || !vaqt)
    return res.status(400).json({ xato: 'Ism, telefon, sana va vaqt majburiy' });

  const kishi = Number(kishiSoni);
  if (!(kishi >= 1 && kishi <= 100))
    return res.status(400).json({ xato: "Kishi soni noto'g'ri" });

  const sanaDate = new Date(sana);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  if (isNaN(sanaDate.getTime()) || sanaDate < bugun)
    return res.status(400).json({ xato: "O'tgan sanaga bron qilib bo'lmaydi" });

  if (tableId) {
    const table = await prisma.restaurantTable.findUnique({ where: { id: Number(tableId) } });
    if (!table) return res.status(400).json({ xato: 'Stol topilmadi' });
  }

  const booking = await prisma.booking.create({
    data: {
      tableId: tableId ? Number(tableId) : null,
      mijozIsmi: mijozIsmi.trim(),
      telefon: telefon.trim(),
      sana: sanaDate,
      vaqt,
      kishiSoni: kishi,
      izoh: izoh?.trim() || null,
    },
    include: { table: true },
  });
  // Faqat token bilan ulangan xodimlarga (mijoz PII himoyasi)
  req.app.get('io').to('kassir').emit('yangi_bron', booking);
  res.status(201).json(booking);
});

// GET /api/bookings — barcha bronlar (kassir/admin)
router.get('/', authMiddleware, async (req, res) => {
  const { sana, holat } = req.query;
  const where = {};
  if (holat) where.holat = holat;
  if (sana) {
    const kun = new Date(sana);
    const ertasi = new Date(kun);
    ertasi.setDate(ertasi.getDate() + 1);
    where.sana = { gte: kun, lt: ertasi };
  }
  const bookings = await prisma.booking.findMany({
    where,
    include: { table: true },
    orderBy: [{ sana: 'asc' }, { vaqt: 'asc' }],
  });
  res.json(bookings);
});

// PATCH /api/bookings/:id/holat (kassir/admin)
router.patch('/:id/holat', authMiddleware, async (req, res) => {
  const { holat } = req.body;
  if (!BRON_HOLATLAR.includes(holat))
    return res.status(400).json({ xato: "Noto'g'ri holat" });

  const mavjud = await prisma.booking.findUnique({ where: { id: Number(req.params.id) } });
  if (!mavjud) return res.status(404).json({ xato: 'Bron topilmadi' });

  const booking = await prisma.booking.update({
    where: { id: mavjud.id },
    data: { holat },
    include: { table: true },
  });
  req.app.get('io').to('kassir').emit('bron_yangilandi', booking);
  res.json(booking);
});

module.exports = router;
