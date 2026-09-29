-- CreateEnum
CREATE TYPE "ItemUnit" AS ENUM ('UNIT', 'KG', 'G', 'L', 'ML', 'PACK', 'BOX', 'BOTTLE', 'CAN', 'DOZEN');

-- AlterTable
ALTER TABLE "shopper_items" ADD COLUMN     "unit" "ItemUnit" NOT NULL DEFAULT 'UNIT',
ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,3);
