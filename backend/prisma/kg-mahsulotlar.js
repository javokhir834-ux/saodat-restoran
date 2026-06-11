// Kg bilan o'lchanadigan mahsulotlar (baliq, go'sht) qo'shadi.
// Mavjud ma'lumotlarni O'CHIRMAYDI — qayta ishga tushirish xavfsiz (idempotent).
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// tur: 'weight' → kg, qadam: 0.5 (yarim kg qadam bilan +/-)
const KG_MAHSULOTLAR = [
  {
    nom: 'Qovurilgan zog\'ora baliq', narx: 68000, qoldiq: 12,
    tavsif: 'Yangi zog\'ora baliq, ziravorlar bilan qovurilgan — kg hisobida',
    rasmUrl: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=400&h=300&fit=crop',
  },
  {
    nom: 'Forel (qizil baliq)', narx: 110000, qoldiq: 8,
    tavsif: 'Tog\' forelidan, ko\'mirda yoki tovada — kg hisobida',
    rasmUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
  },
  {
    nom: 'Som baliq', narx: 72000, qoldiq: 10,
    tavsif: 'Yirik som baliq filesi, suyaksiz — kg hisobida',
    rasmUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop',
  },
  {
    nom: 'Sazan baliq', narx: 58000, qoldiq: 15,
    tavsif: 'Mahalliy hovuz sazani, yangi — kg hisobida',
    rasmUrl: 'https://images.unsplash.com/photo-1611171711791-b34fa42e9fc4?w=400&h=300&fit=crop',
  },
  {
    nom: 'Qo\'y go\'shti (kabobbop)', narx: 95000, qoldiq: 20,
    tavsif: 'Yangi qo\'y go\'shti, kabob uchun tayyorlangan — kg hisobida',
    rasmUrl: 'https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?w=400&h=300&fit=crop',
  },
  {
    nom: 'Mol go\'shti (toza et)', narx: 89000, qoldiq: 18,
    tavsif: 'Suyaksiz mol go\'shti, toza et — kg hisobida',
    rasmUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop',
  },
];

async function main() {
  // 1) "Baliq va go'sht (kg)" kategoriyasini topamiz yoki yaratamiz
  const KAT_NOM = 'Baliq va go\'sht (kg)';
  let kat = await prisma.category.findFirst({ where: { nom: KAT_NOM } });
  if (!kat) {
    kat = await prisma.category.create({ data: { nom: KAT_NOM, tartib: 6 } });
    console.log('✅ Kategoriya yaratildi:', KAT_NOM);
  } else {
    console.log('ℹ️  Kategoriya allaqachon bor:', KAT_NOM);
  }

  // 2) Mahsulotlarni qo'shamiz (mavjudini o'tkazib yuboramiz)
  for (const m of KG_MAHSULOTLAR) {
    const bor = await prisma.product.findFirst({ where: { nom: m.nom } });
    if (bor) {
      console.log('  ⏭️  Mavjud:', m.nom);
      continue;
    }
    await prisma.product.create({
      data: {
        categoryId: kat.id,
        nom: m.nom,
        tavsif: m.tavsif,
        narx: m.narx,
        rasmUrl: m.rasmUrl,
        birlik: 'kg',
        tur: 'weight',
        qadam: 0.5,
        qoldiq: m.qoldiq,
      },
    });
    console.log('  ➕ Qo\'shildi:', m.nom, `— ${m.narx.toLocaleString()} so'm/kg`);
  }

  console.log('🎉 Tayyor! Kg mahsulotlar menyuga qo\'shildi.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
