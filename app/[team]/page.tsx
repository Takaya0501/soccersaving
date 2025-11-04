// Vercel
import prisma from '@/lib/prisma';
import TeamClientPage from './TeamClientPage';
import type { Metadata } from 'next';

interface TeamSavings {
  // インデックスシグネチャ
  [competition: string]: { total: number }; 
}

export const metadata: Metadata = {
  title: 'チームページ',  // → "チームページ | サッカー貯金アプリ" になる
}

// ✅ 戻り値の型を明示的に指定 (Promise<TeamSavings>)
async function getTeamSavings(teamName: string): Promise<TeamSavings> {
  try {
    const allSavings = await prisma.savings.groupBy({
      by: ['competition'],
      _sum: { amount: true },
      where: { team: teamName },
    });

    // ✅ 変数 'result' に型 (TeamSavings) を明示的に指定
    const result: TeamSavings = {}; 
    
    allSavings.forEach(row => {
      if (row.competition) {
        result[row.competition] = { total: row._sum.amount ?? 0 };
      }
    });
    return result;
  } catch (error) {
    console.error('チームの貯金額取得に失敗しました:', error);
    return {};
  }
}

interface TeamPageProps {  // ❌ HistoryPageProps → ✅ TeamPageProps
  params: Promise<{ team: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {  // ❌ HistoryPage → ✅ TeamPage
  const { team } = await params;
  
  // ✅ getTeamSavings 関数を呼び出す
  const teamSavings = await getTeamSavings(team);
  
  // これらは不要かもしれませんが、必要であれば残す
  const savings = await prisma.savings.findMany({
    where: { team },
    orderBy: { timestamp: 'desc' }
  });
  
  const matches = await prisma.matches.findMany({
    where: { team },
    orderBy: { match_date: 'desc' }
  });
  
  const awards = await prisma.awards.findMany({
    where: { team }
  });
  
  // ✅ team を teamName として渡す
  return <TeamClientPage teamName={team} teamSavings={teamSavings} />;
}