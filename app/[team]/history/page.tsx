// app/[team]/history/page.tsx
import prisma from '@/lib/prisma';
import MatchHistoryClientPage from './MatchHistoryClientPage';
// Prismaの型をインポート
import type { Savings, Matches } from '@prisma/client';

// EditSavingForm が必要とする結合されたデータ型
export interface MatchSavingWithDetails extends Savings {
  is_final: number;
  is_overtime_or_pk: number;
}

async function getMatchHistory(team: string): Promise<MatchSavingWithDetails[]> {
  const history = await prisma.savings.findMany({
    where: { team: team },
    orderBy: {
      timestamp: 'desc',
    },
  });

  // 履歴から match_name のリストを取得
  const matchNames = history.map(h => h.match_name);

  // 関連する Matches 情報を取得
  const matches = await prisma.matches.findMany({
    where: {
      match_name: {
        in: matchNames,
      },
    },
    select: {
      match_name: true,
      is_final: true,
      is_overtime_or_pk: true,
    },
  });

  // Matches の情報を Map に変換 (高速ルックアップのため)
  const matchesMap = new Map<string, Pick<Matches, 'is_final' | 'is_overtime_or_pk'>>();
  matches.forEach(m => {
    matchesMap.set(m.match_name, { is_final: m.is_final, is_overtime_or_pk: m.is_overtime_or_pk });
  });

  // Savings の履歴に Matches の情報をマージ
  const combinedHistory = history.map(saving => {
    const matchDetails = matchesMap.get(saving.match_name);
    return {
      ...saving,
      // 試合情報が見つからない場合 (例: 順位ボーナス) は 0 (false) を設定
      is_final: matchDetails?.is_final ?? 0, 
      is_overtime_or_pk: matchDetails?.is_overtime_or_pk ?? 0,
    };
  });

  return combinedHistory;
}

export default async function MatchHistoryPage({ params }: { params: { team: string } }) {
  // const teamName = params.team; // 変更前
  const awaitedParams = await params; // 変更後: params を await
  const teamName = awaitedParams.team; // 変更後: await した結果を使用
  const history = await getMatchHistory(teamName);

  return (
    <MatchHistoryClientPage history={history} teamName={teamName} />
  );
}

