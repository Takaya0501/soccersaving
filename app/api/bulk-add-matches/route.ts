import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント
// ✅ Prismaの型をインポート
import type { Prisma, Matches } from '@prisma/client';

// JSONペイロードの構造を定義（入力データ）
interface MatchData {
  team: string;
  competition: string;
  match_name: string; // JSONペイロードのキー
  is_overtime_or_pk?: boolean;
  is_final?: boolean;
}

// Prismaの単一操作の返り値の型を定義
type MatchesUpsertPromise = Prisma.Prisma__MatchesClient<Matches, never>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matches: MatchData[] = body.matches || [];

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json({ message: '有効な試合データの配列を送信してください。' }, { status: 400 });
    }

    // $transactionで実行するアクションを準備
    const transactionActions = matches.map((match) => {
        const { team, competition, match_name, is_overtime_or_pk, is_final } = match;

        // 必須データの検証
        if (!team || !competition || !match_name) {
          return null; 
        }

        const matchNameLower = match_name.toLowerCase();
        const teamLower = team.toLowerCase();
        const competitionLower = competition.toLowerCase();
        
        // Matchモデル（複数形）を使用
        return prisma.matches.upsert({ 
          // 修正1: matchName -> match_name (where句)
          where: { match_name: matchNameLower },
          update: {
            team: teamLower,
            competition: competitionLower,
            // 修正2: isOvertimeOrPK -> is_overtime_or_pk (update句)
            is_overtime_or_pk: (is_overtime_or_pk ?? false) ? 1 : 0, 
            // 修正3: isFinal -> is_final (update句)
            is_final: (is_final ?? false) ? 1 : 0,
          },
          create: {
            team: teamLower,
            competition: competitionLower,
            // 修正4: matchName -> match_name (create句)
            match_name: matchNameLower,
            // 修正5: isOvertimeOrPK -> is_overtime_or_pk (create句)
            is_overtime_or_pk: (is_overtime_or_pk ?? false) ? 1 : 0,
            // 修正6: isFinal -> is_final (create句)
            is_final: (is_final ?? false) ? 1 : 0,
          },
        });
      })
      // ✅ フィルタリング時に型ガードを使用し、nullではないPromise<Matches>の型であることを保証
      .filter((action): action is MatchesUpsertPromise => action !== null); 

    if (transactionActions.length === 0) {
        return NextResponse.json({
            message: '追加対象の有効な試合データがありませんでした。',
            addedCount: 0,
            skippedCount: matches.length
        });
    }

    // ✅ $transactionの結果は Promise<Matches>[] となるため、anyを削除
    const results = await prisma.$transaction(transactionActions); 

    const successfulOps = results.length;
    const skippedCount = matches.length - successfulOps;
    const addedCount = successfulOps;

    return NextResponse.json({
      message: `${addedCount}件の試合が追加されました。${skippedCount}件はスキップされました（重複または無効なデータ）。`,
      addedCount,
      skippedCount
    });
  } catch (error) {
    console.error('一括追加中にエラー:', error);

    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
