-- CreateEnum
CREATE TYPE "CodeType" AS ENUM ('user_verification', 'password_reset');

-- CreateTable
CREATE TABLE "codes" (
    "id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "code_type" "CodeType" NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entity_id" UUID NOT NULL,

    CONSTRAINT "codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopper_lists" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,

    CONSTRAINT "shopper_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopper_items" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchased_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shopper_list_id" UUID NOT NULL,

    CONSTRAINT "shopper_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopper_list_members" (
    "id" UUID NOT NULL,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "member_id" UUID NOT NULL,
    "shopper_list_id" UUID NOT NULL,

    CONSTRAINT "shopper_list_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "codes" ADD CONSTRAINT "codes_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopper_lists" ADD CONSTRAINT "shopper_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopper_items" ADD CONSTRAINT "shopper_items_shopper_list_id_fkey" FOREIGN KEY ("shopper_list_id") REFERENCES "shopper_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopper_list_members" ADD CONSTRAINT "shopper_list_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopper_list_members" ADD CONSTRAINT "shopper_list_members_shopper_list_id_fkey" FOREIGN KEY ("shopper_list_id") REFERENCES "shopper_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
