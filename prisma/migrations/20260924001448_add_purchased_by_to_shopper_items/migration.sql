-- AlterTable
ALTER TABLE "shopper_items" ADD COLUMN     "purchased_by_id" UUID;

-- AddForeignKey
ALTER TABLE "shopper_items" ADD CONSTRAINT "shopper_items_purchased_by_id_fkey" FOREIGN KEY ("purchased_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
