// app/[team]/history/page.tsx
import prisma from '@/lib/prisma';
import MatchHistoryClientPage from './MatchHistoryClientPage';
// ⬇️ 修正: Prismaの型インポートを削除
// import type { Savings, Matches } from '@prisma/client';

// ⬇️ 修正: 新しい types.ts から型をインポート
import type { MatchSavingWithDetails } from './types'; 

// ⬇️ 修正: 戻り値の型を明示的に指定
async function getMatchHistory(team: string): Promise<MatchSavingWithDetails[]> {
  const history = await prisma.savings.findMany({
    where: { team: team },
    orderBy: {
      timestamp: 'desc',
    },
  });

  const matchNames = history.map(h => h.match_name);
  const matches = await prisma.matches.findMany({
    where: { match_name: { in: matchNames } },
    select: {
      match_name: true,
      is_final: true,
      is_overtime_or_pk: true,
    }
  });

  const matchesMap = new Map(matches.map(m => [m.match_name, { is_final: m.is_final, is_overtime_or_pk: m.is_overtime_or_pk }]));

  // ⬇️ 修正: マージ後の型を明示
  const historyWithDetails: MatchSavingWithDetails[] = history.map(item => ({
    ...item,
    is_final: matchesMap.get(item.match_name)?.is_final ?? 0,
    is_overtime_or_pk: matchesMap.get(item.match_name)?.is_overtime_or_pk ?? 0,
  }));

  return historyWithDetails;
}

// ⬇️ 修正: 型定義を削除
/*
export type MatchSavingWithDetails = Savings & Pick<Matches, 'is_final' | 'is_overtime_or_pk'>;
*/

export default async function MatchHistoryPage({ params: p }: { params: { team: string } }) {
  const teamName = p.team;
  const history = await getMatchHistory(teamName);

  return (
    <MatchHistoryClientPage history={history} teamName={teamName} />
  );
}