import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import TeamClientPage from './TeamClientPage';

const prisma = new PrismaClient();

async function getTeamSavings(teamName: string) {
  try {
    const allSavings = await prisma.savings.groupBy({
      by: ['competition'],
      _sum: { amount: true },
      where: { team: teamName },
    });

    const result = {};
    allSavings.forEach(row => {
      if (row.competition) {
        result[row.competition] = { total: row._sum.amount || 0 };
      }
    });
    return result;
  } catch (error) {
    console.error('チームの貯金額取得に失敗しました:', error);
    return {};
  }
}

export default async function TeamPage({ params }: { params: { team: string } }) {
  const teamName = params.team;
  
  const teamSavings = await getTeamSavings(teamName);

  return <TeamClientPage teamName={teamName} teamSavings={teamSavings} />;
}