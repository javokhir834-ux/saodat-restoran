-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "tartib" INTEGER NOT NULL DEFAULT 0,
    "faol" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "tavsif" TEXT,
    "narx" DOUBLE PRECISION NOT NULL,
    "rasmUrl" TEXT,
    "birlik" TEXT NOT NULL DEFAULT 'porsiya',
    "tur" TEXT NOT NULL DEFAULT 'whole',
    "qadam" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "qoldiq" DOUBLE PRECISION,
    "faol" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" SERIAL NOT NULL,
    "raqam" INTEGER NOT NULL,
    "nom" TEXT,
    "sigim" INTEGER NOT NULL DEFAULT 4,
    "qrKodUrl" TEXT,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "raqam" TEXT NOT NULL,
    "holat" TEXT NOT NULL DEFAULT 'yangi',
    "tur" TEXT NOT NULL DEFAULT 'stol',
    "tableId" INTEGER,
    "mijozIsmi" TEXT,
    "mijozTelefon" TEXT,
    "manzil" TEXT,
    "izoh" TEXT,
    "jamiSumma" DOUBLE PRECISION NOT NULL,
    "tolovHolati" TEXT NOT NULL DEFAULT 'kutilmoqda',
    "tolovTuri" TEXT,
    "yaratilganVaqt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yangilanganVaqt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "mahsulotNomi" TEXT NOT NULL,
    "miqdori" DOUBLE PRECISION NOT NULL,
    "birlik" TEXT NOT NULL,
    "narx" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER,
    "mijozIsmi" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "sana" TIMESTAMP(3) NOT NULL,
    "vaqt" TEXT NOT NULL,
    "kishiSoni" INTEGER NOT NULL,
    "holat" TEXT NOT NULL DEFAULT 'yangi',
    "izoh" TEXT,
    "yaratilganVaqt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "parolHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'kassir',

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tables_raqam_key" ON "tables"("raqam");

-- CreateIndex
CREATE UNIQUE INDEX "orders_raqam_key" ON "orders"("raqam");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_login_key" ON "admin_users"("login");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
