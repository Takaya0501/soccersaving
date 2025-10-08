import { notFound } from 'next/navigation';
import { openDb } from '@/lib/db';
import TeamClientPage from './TeamClientPage';

interface TeamSavings {
  [competition: string]: { total: number };
}

async function getTeamSavings(teamName: string): Promise<TeamSavings> {
  const db = await openDb();
  const allSavings = await db.all(
    'SELECT competition, SUM(amount) AS total FROM savings WHERE team = ? GROUP BY competition',
    teamName
  );
  await db.close();

  const result: TeamSavings = {};
  allSavings.forEach(row => {
    result[row.competition] = { total: row.total };
  });
  return result;
}

export default async function TeamPage({ params }: { params: { team: string } }) {
  const teamName = params.team;
  
  const teamSavings = await getTeamSavings(teamName);

  return <TeamClientPage teamName={teamName} teamSavings={teamSavings} />;
}