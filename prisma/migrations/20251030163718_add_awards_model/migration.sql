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
CREATE UNIQUE INDEX "Awards_team_competition_key" ON "Awards"("team", "competition");
