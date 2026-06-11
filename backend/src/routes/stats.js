const router = require('express').Router();
const prisma = require('../prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/stats/kunlik — bugungi statistika
router.get('/kunlik', authMiddleware, async (req, res) => {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const ertasi = new Date(bugun);
  ertasi.setDate(ertasi.getDate() + 1);

  const [buyurtmalar, jamiSumma, yangi] = await Promise.all([
    prisma.order.count({ where: { yaratilganVaqt: { gte: bugun, lt: ertasi } } }),
    prisma.order.aggregate({
      where: { yaratilganVaqt: { gte: bugun, lt: ertasi }, holat: { not: 'rad' } },
      _sum: { jamiSumma: true },
    }),
    prisma.order.count({ where: { holat: 'yangi' } }),
  ]);

  res.json({
    buyurtmaSoni: buyurtmalar,
    jamiDaromad: jamiSumma._sum.jamiSumma || 0,
    yangi,
  });
});

// GET /api/stats/oylik — oylik statistika
router.get('/oylik', authMiddleware, adminOnly, async (req, res) => {
  const { yil, oy } = req.query;
  const y = yil ? Number(yil) : new Date().getFullYear();
  const m = oy ? Number(oy) - 1 : new Date().getMonth();
  const boshi = new Date(y, m, 1);
  const oxiri = new Date(y, m + 1, 0, 23, 59, 59);

  const orders = await prisma.order.findMany({
    where: { yaratilganVaqt: { gte: boshi, lte: oxiri }, holat: { not: 'rad' } },
    select: { jamiSumma: true, yaratilganVaqt: true },
  });

  const kunlarMap = {};
  orders.forEach((o) => {
    const kun = o.yaratilganVaqt.toISOString().split('T')[0];
    kunlarMap[kun] = (kunlarMap[kun] || 0) + o.jamiSumma;
  });

  res.json({
    jami: orders.reduce((s, o) => s + o.jamiSumma, 0),
    buyurtmaSoni: orders.length,
    kunlar: Object.entries(kunlarMap).map(([kun, summa]) => ({ kun, summa })),
  });
});

// GET /api/stats/top-mahsulotlar
router.get('/top-mahsulotlar', authMiddleware, async (req, res) => {
  const items = await prisma.orderItem.groupBy({
    by: ['productId', 'mahsulotNomi'],
    _sum: { miqdori: true },
    orderBy: { _sum: { miqdori: 'desc' } },
    take: 10,
  });
  res.json(items);
});

module.exports = router;
