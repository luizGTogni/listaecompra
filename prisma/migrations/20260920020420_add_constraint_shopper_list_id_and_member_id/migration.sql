/*
  Warnings:

  - A unique constraint covering the columns `[shopper_list_id,member_id]` on the table `shopper_list_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shopper_list_members_shopper_list_id_member_id_key" ON "shopper_list_members"("shopper_list_id", "member_id");
