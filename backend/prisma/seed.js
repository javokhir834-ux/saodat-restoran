require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Ma\'lumotlar yuklanmoqda...');

  // Avvalgi ma'lumotlarni tozalash
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.adminUser.deleteMany();

  // Adminlar
  await prisma.adminUser.create({ data: { login: 'admin', parolHash: await bcrypt.hash('admin123', 10), rol: 'admin' } });
  await prisma.adminUser.create({ data: { login: 'kassir', parolHash: await bcrypt.hash('kassir123', 10), rol: 'kassir' } });

  // Kategoriyalar
  const [issiq, salat, non, ichimlik, shirinlik, kgKat] = await Promise.all([
    prisma.category.create({ data: { nom: 'Issiq taomlar', tartib: 1 } }),
    prisma.category.create({ data: { nom: 'Salatlar', tartib: 2 } }),
    prisma.category.create({ data: { nom: 'Non va lavash', tartib: 3 } }),
    prisma.category.create({ data: { nom: 'Ichimliklar', tartib: 4 } }),
    prisma.category.create({ data: { nom: 'Shirinliklar', tartib: 5 } }),
    prisma.category.create({ data: { nom: 'Baliq va go\'sht (kg)', tartib: 6 } }),
  ]);

  // Mahsulotlar (Unsplash rasmlar bilan)
  await prisma.product.createMany({ data: [
    // Issiq taomlar
    {
      categoryId: issiq.id, nom: 'Osh', narx: 35000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Farg\'ona uslubida tayyorlangan an\'anaviy osh, sabzi va go\'sht bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
    },
    {
      categoryId: issiq.id, nom: 'Lag\'mon', narx: 28000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Qo\'lda tortilgan lag\'mon, go\'sht va sabzavotlar bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    },
    {
      categoryId: issiq.id, nom: 'Shurva', narx: 25000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Qo\'y go\'shtidan tayyorlangan milliy sho\'rva, kartoshka va sabzavotlar bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    },
    {
      categoryId: issiq.id, nom: 'Manti', narx: 22000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Bug\'da pishirilgan manti, qo\'zichoq go\'shti bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172789a?w=400&h=300&fit=crop',
    },
    {
      categoryId: issiq.id, nom: 'Dimlama', narx: 30000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Sabzavotlar bilan go\'sht dimlamasi, o\'tlar bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    },
    {
      categoryId: issiq.id, nom: 'Kabob', narx: 8000, birlik: 'sixcha', tur: 'whole',
      tavsif: 'Ko\'mirda pishirilgan qo\'y kabob, piyoz halqalari bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop',
    },
    {
      categoryId: issiq.id, nom: 'Norin', narx: 32000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Qo\'y go\'shti bilan tayyorlangan uy eritmasi',
      rasmUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop',
    },
    // Salatlar
    {
      categoryId: salat.id, nom: 'Achichuk', narx: 12000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Pomidor, piyoz va o\'tlar bilan milliy salat',
      rasmUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    },
    {
      categoryId: salat.id, nom: 'Toshkent salati', narx: 18000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Mol tili va rediska bilan mazali salat',
      rasmUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    },
    {
      categoryId: salat.id, nom: 'Ko\'k salat', narx: 10000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Mavsumiy ko\'kalamzorlar, pomidor va bodring bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    },
    // Non va lavash
    {
      categoryId: non.id, nom: 'Tandir non', narx: 5000, birlik: 'dona', tur: 'whole',
      tavsif: 'Tandir nonidan yangi pishirilgan issiq non',
      rasmUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    },
    {
      categoryId: non.id, nom: 'Lavash', narx: 3000, birlik: 'dona', tur: 'whole',
      tavsif: 'Ingichka yumshoq lavash',
      rasmUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    },
    // Ichimliklar
    {
      categoryId: ichimlik.id, nom: 'Ko\'k choy', narx: 5000, birlik: 'choynak', tur: 'whole',
      tavsif: 'Samarqand ko\'k choy, choynak bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    },
    {
      categoryId: ichimlik.id, nom: 'Qora choy', narx: 5000, birlik: 'choynak', tur: 'whole',
      tavsif: 'Lemon va shakar bilan qora choy',
      rasmUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
    },
    {
      categoryId: ichimlik.id, nom: 'Limonad', narx: 12000, birlik: 'stakan', tur: 'whole',
      tavsif: 'Uy limonadasi, yangi limon va yalpiz bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
    },
    {
      categoryId: ichimlik.id, nom: 'Kompot', narx: 8000, birlik: 'stakan', tur: 'whole',
      tavsif: 'Mavsumiy mevali kompot',
      rasmUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop',
    },
    {
      categoryId: ichimlik.id, nom: 'Coca-Cola', narx: 10000, birlik: 'dona', tur: 'whole',
      tavsif: '0.5 litrlik sovuq Coca-Cola',
      rasmUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop',
    },
    // Shirinliklar
    {
      categoryId: shirinlik.id, nom: 'Halva', narx: 12000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'An\'anaviy o\'zbek halvasi, pista bilan',
      rasmUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    },
    {
      categoryId: shirinlik.id, nom: 'Chak-chak', narx: 15000, birlik: 'porsiya', tur: 'whole',
      tavsif: 'Asalda pishirilgan milliy shirinlik',
      rasmUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop',
    },
    {
      categoryId: shirinlik.id, nom: 'Pishloq pirog', narx: 18000, birlik: 'bo\'lak', tur: 'whole',
      tavsif: 'Uy pishirig\'i, ichida qaymoq pishloq',
      rasmUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop',
    },
    // Baliq va go'sht — KG bilan o'lchanadi (tur: weight, qadam: 0.5)
    {
      categoryId: kgKat.id, nom: 'Qovurilgan zog\'ora baliq', narx: 68000, birlik: 'kg', tur: 'weight', qadam: 0.5, qoldiq: 12,
      tavsif: 'Yangi zog\'ora baliq, ziravorlar bilan qovurilgan — kg hisobida',
      rasmUrl: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=400&h=300&fit=crop',
    },
    {
      categoryId: kgKat.id, nom: 'Forel (qizil baliq)', narx: 110000, birlik: 'kg', tur: 'weight', qadam: 0.5, qoldiq: 8,
      tavsif: 'Tog\' forelidan, ko\'mirda yoki tovada — kg hisobida',
      rasmUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    },
    {
      categoryId: kgKat.id, nom: 'Som baliq', narx: 72000, birlik: 'kg', tur: 'weight', qadam: 0.5, qoldiq: 10,
      tavsif: 'Yirik som baliq filesi, suyaksiz — kg hisobida',
      rasmUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop',
    },
    {
      categoryId: kgKat.id, nom: 'Sazan baliq', narx: 58000, birlik: 'kg', tur: 'weight', qadam: 0.5, qoldiq: 15,
      tavsif: 'Mahalliy hovuz sazani, yangi — kg hisobida',
      rasmUrl: 'https://images.unsplash.com/photo-1611171711791-b34fa42e9fc4?w=400&h=300&fit=crop',
    },
    {
      categoryId: kgKat.id, nom: 'Qo\'y go\'shti (kabobbop)', narx: 95000, birlik: 'kg', tur: 'weight', qadam: 0.5, qoldiq: 20,
      tavsif: 'Yangi qo\'y go\'shti, kabob uchun tayyorlangan — kg hisobida',
      rasmUrl: 'https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?w=400&h=300&fit=crop',
    },
    {
      categoryId: kgKat.id, nom: 'Mol go\'shti (toza et)', narx: 89000, birlik: 'kg', tur: 'weight', qadam: 0.5, qoldiq: 18,
      tavsif: 'Suyaksiz mol go\'shti, toza et — kg hisobida',
      rasmUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop',
    },
  ]});

  // Stollar
  for (let i = 1; i <= 12; i++) {
    await prisma.restaurantTable.create({
      data: { raqam: i, nom: `Stol ${i}`, sigim: i <= 6 ? 4 : 6 },
    });
  }

  console.log('✅ Tayyor! Admin: admin/admin123 | Kassir: kassir/kassir123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
