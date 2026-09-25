/*
  Warnings:

  - A unique constraint covering the columns `[share_code]` on the table `shopper_lists` will be added. If there are existing duplicate values, this will fail.
  - The required column `share_code` was added to the `shopper_lists` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "shopper_lists" ADD COLUMN     "share_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "shopper_lists_share_code_key" ON "shopper_lists"("share_code");
