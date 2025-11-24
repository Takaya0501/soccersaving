/*
  Warnings:

  - A unique constraint covering the columns `[team,competition,season]` on the table `Awards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[match_name,season,team]` on the table `Matches` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Awards_team_competition_key";

-- DropIndex
DROP INDEX "public"."Matches_match_name_key";

-- AlterTable
ALTER TABLE "Awards" ADD COLUMN     "season" TEXT NOT NULL DEFAULT '25/26';

-- AlterTable
ALTER TABLE "Matches" ADD COLUMN     "season" TEXT NOT NULL DEFAULT '25/26';

-- AlterTable
ALTER TABLE "Savings" ADD COLUMN     "season" TEXT NOT NULL DEFAULT '25/26';

-- CreateIndex
CREATE UNIQUE INDEX "Awards_team_competition_season_key" ON "Awards"("team", "competition", "season");

-- CreateIndex
CREATE UNIQUE INDEX "Matches_match_name_season_team_key" ON "Matches"("match_name", "season", "team");

-- CreateIndex
CREATE INDEX "Savings_season_idx" ON "Savings"("season");
