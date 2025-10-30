// app/[team]/history/page.tsx
// Vercel
import prisma from '@/lib/prisma';
import MatchHistoryClientPage from './MatchHistoryClientPage';
// ⬇️ 修正: Matches と Savings をインポート
import type { Savings, Matches } from '@prisma/client';

// ⬇️ 修正: 関連する Matches の情報も取得するように変更
async function getMatchHistory(team: string) {
  const history = await prisma.savings.findMany({
    where: { team: team },
    orderBy: {
      timestamp: 'desc',
    },
    // ⬇️ 関連する Matches データを取得するための include (match_name で紐付け)
    // ただし、リレーションが張られていないため、手動で matches を取得する
  });

  // Matches から is_final と is_overtime_or_pk を取得
  const matchNames = history.map(h => h.match_name);
  const matches = await prisma.matches.findMany({
    where: { match_name: { in: matchNames } },
    select: {
      match_name: true,
      is_final: true,
      is_overtime_or_pk: true,
    }
  });

  // 取得した matches 情報を history にマージ
  const matchesMap = new Map(matches.map(m => [m.match_name, { is_final: m.is_final, is_overtime_or_pk: m.is_overtime_or_pk }]));

  const historyWithDetails = history.map(item => ({
    ...item,
    is_final: matchesMap.get(item.match_name)?.is_final ?? 0,
    is_overtime_or_pk: matchesMap.get(item.match_name)?.is_overtime_or_pk ?? 0,
  }));

  return historyWithDetails;
}

// ページがクライアントコンポーネントに渡すデータの型
// 必要な Matches のプロパティを Savings にマージ
export type MatchSavingWithDetails = Savings & Pick<Matches, 'is_final' | 'is_overtime_or_pk'>;


// ⬇️ 修正: { params } を { params: p } に変更
export default async function MatchHistoryPage({ params: p }: { params: { team: string } }) {
  const params = await p; // ⬅️ 修正: params オブジェクトを await する
  const teamName = params.team;
  const history = await getMatchHistory(teamName);

  return (
    <MatchHistoryClientPage history={history} teamName={teamName} />
  );
}

