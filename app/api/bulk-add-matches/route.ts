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

    let addedCount = 0;
    let skippedCount = 0;

    // 非同期な一括操作を安全に実行
    const transactionActions = matches.map((match: MatchData) => {
        const { team, competition, match_name, is_overtime_or_pk, is_final } = match;

        // 必須データの検証
        if (!team || !competition || !match_name) {
          // トランザクション内のPromiseチェーンでスキップ数をカウントすることは非推奨ですが、
          // ここでは後で最終的なカウントを修正するため、Promise.resolve(null)で続行します。
          // 最終的なカウントロジックで対応します。
          return Promise.resolve(null); 
        }

        const matchNameLower = match_name.toLowerCase();
        const teamLower = team.toLowerCase();
        const competitionLower = competition.toLowerCase();
        
        // upsertを使用して、重複を気にせず追加・更新を試みる
        // モデル名を Match (単数形) に統一
        return prisma.match.upsert({ 
          where: { matchName: matchNameLower },
          update: {
            team: teamLower,
            competition: competitionLower,
            // Boolean型に統一されているはずですが、Int型の場合は0/1を渡します。
            // schema.prismaを単数形に修正した際、Int(0/1)のままにしているため、ここでは
            // boolean ?? false の結果を数値 (0 or 1) に変換して渡します。
            isOvertimeOrPK: (is_overtime_or_pk ?? false) ? 1 : 0, 
            isFinal: (is_final ?? false) ? 1 : 0,
          },
          create: {
            team: teamLower,
            competition: competitionLower,
            matchName: matchNameLower,
            isOvertimeOrPK: (is_overtime_or_pk ?? false) ? 1 : 0,
            isFinal: (is_final ?? false) ? 1 : 0,
          },
        });
      }).filter(action => action !== null); // nullを返した要素をフィルタリング

    // フィルタリング後のアクションリストに対してトランザクションを実行
    const results = await prisma.$transaction(transactionActions as any); 

    // nullでない結果（追加または更新されたレコード）の数を数え、スキップ数を調整
    const successfulOps = results.length;
    skippedCount = matches.length - successfulOps;
    addedCount = successfulOps;

    return NextResponse.json({
      message: `${addedCount}件の試合が追加または更新されました。${skippedCount}件はスキップされました（無効なデータ）。`,
      addedCount,
      skippedCount
    });
  } catch (error) {
    console.error('一括追加中にエラー:', error);

    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
