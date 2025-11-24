// Vercel
import prisma from '@/lib/prisma';
import TeamClientPage from './TeamClientPage';
import type { Metadata } from 'next';
// import { SEASONS, TEAM_CONFIG } from '@/lib/config';


interface TeamSavings {
  // インデックスシグネチャ
  [competition: string]: { total: number }; 
}


export const metadata: Metadata = {
  title: 'チームページ',  // → "チームページ | サッカー貯金アプリ" になる
}

// ✅ 戻り値の型を明示的に指定 (Promise<TeamSavings>)
async function getTeamSavings(teamName: string, season: string): Promise<TeamSavings> {
  try {
    const allSavings = await prisma.savings.groupBy({
      by: ['competition'],
      _sum: { amount: true },
      where: { 
        team: teamName,
        season: season // ✅ 追加: シーズンでデータを絞り込む
      },
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

interface TeamPageProps {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ season?: string }>; // クエリパラメータを受け取る
}

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
  const { team } = await params;
  const { season } = await searchParams;

  const teamDecoded = decodeURIComponent(team).toLowerCase();
  // URLにシーズンがなければデフォルト(25/26)にする
  const currentSeason = season || '25/26';

  const teamSavings = await getTeamSavings(teamDecoded, currentSeason);

  return (
    <TeamClientPage 
      teamName={teamDecoded} 
      teamSavings={teamSavings} 
      currentSeason={currentSeason} // ✅ クライアントへ渡す
    />
  );
}