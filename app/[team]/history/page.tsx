// app/[team]/history/page.tsx
import prisma from '@/lib/prisma';
import MatchHistoryClientPage from './MatchHistoryClientPage';

import type { MatchSavingWithDetails } from './types'; 

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

  const historyWithDetails: MatchSavingWithDetails[] = history.map(item => ({
    ...item,
    is_final: matchesMap.get(item.match_name)?.is_final ?? 0,
    is_overtime_or_pk: matchesMap.get(item.match_name)?.is_overtime_or_pk ?? 0,
  }));

  return historyWithDetails;
}

// ✅ Next.js 15 対応: params を Promise 型に変更
interface HistoryPageProps {
  params: Promise<{ team: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ✅ async 関数にして params を await
export default async function MatchHistoryPage({ params }: HistoryPageProps) {
  const { team } = await params;  // ✅ params を await で解決
  const history = await getMatchHistory(team);

  return (
    <MatchHistoryClientPage history={history} teamName={team} />
  );
}