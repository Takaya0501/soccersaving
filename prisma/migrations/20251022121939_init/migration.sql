-- CreateTable
CREATE TABLE "Savings" (
    "id" SERIAL NOT NULL,
    "team" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "match_name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matches" (
    "id" SERIAL NOT NULL,
    "team" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "match_name" TEXT NOT NULL,
    "is_overtime_or_pk" INTEGER NOT NULL DEFAULT 0,
    "is_final" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Awards" (
    "id" SERIAL NOT NULL,
    "team" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Savings_team_idx" ON "Savings"("team");

-- CreateIndex
CREATE INDEX "Savings_competition_idx" ON "Savings"("competition");

-- CreateIndex
CREATE UNIQUE INDEX "Matches_match_name_key" ON "Matches"("match_name");

-- CreateIndex
CREATE UNIQUE INDEX "Awards_team_competition_key" ON "Awards"("team", "competition");
