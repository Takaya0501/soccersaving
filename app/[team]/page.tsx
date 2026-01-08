import TeamClientPage from './TeamClientPage';
import prisma from '@/lib/prisma';
import { TEAMS } from '@/lib/config'; // ✅ 追加: 設定ファイルをインポート

interface TeamPageProps {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ season?: string }>;
}

// サーバーサイドでデータを取得する関数
async function getTeamSavings(team: string, season: string) {
  // チーム名とシーズンで集計 (APIのロジックと同様)
  const savings = await prisma.savings.groupBy({
    by: ['competition'],
    where: {
      team: team,
      season: season,
    },
    _sum: {
      amount: true,
    },
  });

  // フロントエンドで使いやすい形式に変換
  const result: { [key: string]: { total: number } } = {};
  savings.forEach(item => {
    result[item.competition] = { total: item._sum.amount || 0 };
  });

  return result;
}

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
  const { team } = await params;
  const { season } = await searchParams;

  // URLエンコードされたチーム名をデコード (スペースなどを戻す)
  const teamDecoded = decodeURIComponent(team).toLowerCase();

  // ✅ 修正: 設定ファイルからそのチームの現在のシーズンを取得
  const teamConfig = TEAMS.find(t => t.id === teamDecoded);
  // 設定が見つかればそのシーズン、なければデフォルト '25/26'
  const defaultSeason = teamConfig ? teamConfig.currentSeason : '25/26';

  // URLパラメータで指定があればそれを優先、なければチームごとのデフォルトを使用
  const currentSeason = season || defaultSeason;

  const teamSavings = await getTeamSavings(teamDecoded, currentSeason);

  return (
    <TeamClientPage 
      teamName={teamDecoded} 
      teamSavings={teamSavings} 
      currentSeason={currentSeason} 
    />
  );
}