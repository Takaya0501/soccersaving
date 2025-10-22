import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント

interface MatchData {
  team: string;
  competition: string;
  match_name: string; // JSONペイロードのキー
  is_overtime_or_pk?: boolean;
  is_final?: boolean;
}

export async function POST(request: Request) {
  try {
    const { matches } = await request.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json({ message: '有効な試合データの配列を送信してください。' }, { status: 400 });
    }

    // $transactionで実行するアクションを準備
    const transactionActions = matches.map((match: MatchData) => {
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
      }).filter(action => action !== null);

    if (transactionActions.length === 0) {
        return NextResponse.json({
            message: '追加対象の有効な試合データがありませんでした。',
            addedCount: 0,
            skippedCount: matches.length
        });
    }

    const results = await prisma.$transaction(transactionActions as any); 

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
