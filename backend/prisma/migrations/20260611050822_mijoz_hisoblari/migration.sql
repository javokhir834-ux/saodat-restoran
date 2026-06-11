-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "ballarBerildi" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "tolanganVaqt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "ism" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "parolHash" TEXT NOT NULL,
    "ballar" INTEGER NOT NULL DEFAULT 0,
    "yaratilganVaqt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_telefon_key" ON "customers"("telefon");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
