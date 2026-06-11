const router = require('express').Router();
const prisma = require('../prisma');
const { authMiddleware, mijozAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Har 10 000 so'mga 1 ball — sodiqlik dasturi
function ballHisobla(summa) {
  return Math.floor(summa / 10000);
}

const TURLAR = ['stol', 'yetkazib_berish', 'olib_ketish'];
const HOLATLAR = ['yangi', 'qabul', 'tayyorlanmoqda', 'tayyor', 'berildi', 'rad'];
const TOLOV_TURLARI = ['payme', 'click', 'naqd'];

function buyurtmaRaqam() {
  const d = new Date();
  return `ORD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
}

function kassirgaXabar(req, event, data) {
  req.app.get('io').to('kassir').emit(event, data);
}

// POST /api/orders — yangi buyurtma — FAQAT hisobga kirgan mijoz bera oladi
router.post('/', mijozAuth, asyncHandler(async (req, res) => {
  const { tur, stolRaqam, tableId, mijozIsmi, mijozTelefon, manzil, izoh, items } = req.body;

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ xato: "Savat bo'sh" });
  if (!mijozIsmi?.trim() || !mijozTelefon?.trim())
    return res.status(400).json({ xato: 'Ism va telefon majburiy' });
  if (tur && !TURLAR.includes(tur))
    return res.status(400).json({ xato: "Noto'g'ri buyurtma turi" });
  if (tur === 'yetkazib_berish' && !manzil?.trim())
    return res.status(400).json({ xato: 'Yetkazib berish uchun manzil kerak' });
  for (const item of items) {
    if (!item.productId || !(Number(item.miqdori) > 0))
      return res.status(400).json({ xato: "Mahsulot miqdori noto'g'ri" });
  }

  let table = null;
  if (tur === 'stol' && (stolRaqam || tableId)) {
    table = stolRaqam
      ? await prisma.restaurantTable.findUnique({ where: { raqam: Number(stolRaqam) } })
      : await prisma.restaurantTable.findUnique({ where: { id: Number(tableId) } });
    if (!table) return res.status(400).json({ xato: 'Stol topilmadi' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const productIds = items.map((i) => Number(i.productId));
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, faol: true },
      });

      let jamiSumma = 0;
      const orderItems = items.map((item) => {
        const prod = products.find((p) => p.id === Number(item.productId));
        if (!prod) {
          const e = new Error('Mahsulot topilmadi yoki sotuvda emas');
          e.status = 400;
          throw e;
        }
        const miqdori = Number(item.miqdori);
        if (prod.qoldiq !== null && prod.qoldiq < miqdori) {
          const e = new Error(`"${prod.nom}" yetarli emas — qoldiq: ${prod.qoldiq} ${prod.birlik}`);
          e.status = 409;
          throw e;
        }
        jamiSumma += prod.narx * miqdori;
        return { productId: prod.id, mahsulotNomi: prod.nom, miqdori, birlik: prod.birlik, narx: prod.narx };
      });

      for (const oi of orderItems) {
        const prod = products.find((p) => p.id === oi.productId);
        if (prod.qoldiq !== null) {
          await tx.product.update({
            where: { id: prod.id },
            data: { qoldiq: { decrement: oi.miqdori } },
          });
        }
      }

      return tx.order.create({
        data: {
          raqam: buyurtmaRaqam(),
          tur: tur || 'stol',
          tableId: table?.id ?? null,
          customerId: req.mijoz?.id ?? null,
          mijozIsmi: mijozIsmi.trim(),
          mijozTelefon: mijozTelefon.trim(),
          manzil: manzil?.trim() || null,
          izoh: izoh?.trim() || null,
          jamiSumma,
          items: { create: orderItems },
        },
        include: { items: true, table: true },
      });
    });

    kassirgaXabar(req, 'yangi_buyurtma', order);
    res.status(201).json(order);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ xato: err.message });
    throw err;
  }
}));

// GET /api/orders — barcha buyurtmalar (kassir/admin)
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { holat, sana } = req.query;
  const where = {};
  if (holat) where.holat = holat;
  if (sana) {
    const kun = new Date(sana);
    const ertasi = new Date(kun);
    ertasi.setDate(ertasi.getDate() + 1);
    where.yaratilganVaqt = { gte: kun, lt: ertasi };
  }
  const orders = await prisma.order.findMany({
    where,
    include: { items: true, table: true, customer: { select: { ism: true, ballar: true } } },
    orderBy: { yaratilganVaqt: 'desc' },
  });
  res.json(orders);
}));

// GET /api/orders/holat/:raqam — mijoz uchun (ochiq)
router.get('/holat/:raqam', asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { raqam: req.params.raqam },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ xato: 'Buyurtma topilmadi' });
  res.json(order);
}));

// GET /api/orders/telefon/:telefon — tarix (ochiq)
router.get('/telefon/:telefon', asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { mijozTelefon: req.params.telefon },
    include: { items: true },
    orderBy: { yaratilganVaqt: 'desc' },
    take: 10,
  });
  res.json(orders);
}));

// GET /api/orders/:id
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { items: { include: { product: true } }, table: true },
  });
  if (!order) return res.status(404).json({ xato: 'Topilmadi' });
  res.json(order);
}));

// PATCH /api/orders/:id/holat — kassir/admin
router.patch('/:id/holat', authMiddleware, asyncHandler(async (req, res) => {
  const { holat } = req.body;
  if (!HOLATLAR.includes(holat)) return res.status(400).json({ xato: "Noto'g'ri holat" });

  const mavjud = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { items: true },
  });
  if (!mavjud) return res.status(404).json({ xato: 'Buyurtma topilmadi' });

  const order = await prisma.$transaction(async (tx) => {
    if (holat === 'rad' && mavjud.holat !== 'rad') {
      for (const item of mavjud.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (prod?.qoldiq !== null) {
          await tx.product.update({
            where: { id: item.productId },
            data: { qoldiq: { increment: item.miqdori } },
          });
        }
      }
    }
    return tx.order.update({
      where: { id: mavjud.id },
      data: { holat },
      include: { items: true, table: true },
    });
  });

  kassirgaXabar(req, 'buyurtma_yangilandi', order);
  req.app.get('io').to(`order_${order.raqam}`).emit('holat_ozgardi', { holat: order.holat });
  res.json(order);
}));

// PATCH /api/orders/:id/tolov — demo to'lov (ochiq, haqiqiy karta ulanmagan)
router.patch('/:id/tolov', asyncHandler(async (req, res) => {
  const { tolovTuri } = req.body;
  if (!TOLOV_TURLARI.includes(tolovTuri))
    return res.status(400).json({ xato: "Noto'g'ri to'lov turi" });

  const mavjud = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
  if (!mavjud) return res.status(404).json({ xato: 'Buyurtma topilmadi' });
  if (mavjud.tolovHolati === 'tolandi')
    return res.status(409).json({ xato: "Bu buyurtma allaqachon to'langan" });
  if (mavjud.holat === 'rad')
    return res.status(400).json({ xato: "Rad etilgan buyurtmani to'lab bo'lmaydi" });

  const ball = ballHisobla(mavjud.jamiSumma);

  const order = await prisma.$transaction(async (tx) => {
    const yangilangan = await tx.order.update({
      where: { id: mavjud.id },
      data: { tolovHolati: 'tolandi', tolovTuri, tolanganVaqt: new Date(), ballarBerildi: ball },
      include: { items: true, table: true, customer: true },
    });
    // Hisobi bo'lgan mijozga sodiqlik ballarini qo'shamiz
    if (yangilangan.customerId && ball > 0) {
      await tx.customer.update({
        where: { id: yangilangan.customerId },
        data: { ballar: { increment: ball } },
      });
    }
    return yangilangan;
  });

  kassirgaXabar(req, 'buyurtma_yangilandi', order);
  res.json(order);
}));

module.exports = router;
