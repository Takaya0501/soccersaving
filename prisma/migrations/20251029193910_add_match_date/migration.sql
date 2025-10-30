/*
  Warnings:

  - You are about to drop the `Awards` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Matches" ADD COLUMN     "match_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Savings" ADD COLUMN     "match_date" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."Awards";
