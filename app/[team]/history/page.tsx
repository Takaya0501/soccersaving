// app/[team]/history/page.tsx
import { PrismaClient } from '@prisma/client';
import MatchHistoryClientPage from './MatchHistoryClientPage';

const prisma = new PrismaClient();

async function getMatchHistory(team: string) {
  const history = await prisma.savings.findMany({
    where: { team: team },
    orderBy: {
      timestamp: 'desc',
    },
  });
  return history;
}

export default async function MatchHistoryPage({ params }: { params: { team: string } }) {
  const teamName = params.team;
  const history = await getMatchHistory(teamName);

  return (
    <MatchHistoryClientPage history={history} teamName={teamName} />
  );
}