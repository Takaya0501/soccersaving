import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      season,
      team,
      competition,
      matchName,
      matchDate,
      matchResult,
      isOvertimeOrPK,
      isStarter,
      isFukudaCommentator,
      goals,
      assists,
      isMvp,    // 分割1
      isOnSite, // 分割2
      isFukuda,
    } = body;

    // バリデーション
    if (!team || !competition || !matchName || !matchResult) {
      return NextResponse.json({ message: '必須項目が不足しています。' }, { status: 400 });
    }

    let addedAmount = 0;

    // 1. 試合結果による金額 (例: 勝ち=500, 引き分け=100)
    if (matchResult === 'win') addedAmount += 500;
    else if (matchResult === 'draw') addedAmount += 100;
    
    // 延長・PK戦だった場合 (例: +500)
    if (isOvertimeOrPK) addedAmount += 500;

    // 2. 個人スタッツ (例: ゴール=500, アシスト=500)
    addedAmount += (goals || 0) * 500;
    addedAmount += (assists || 0) * 500;

    // 3. その他ボーナス
    if (isStarter) addedAmount += 100; // スタメン
    if (isFukudaCommentator) addedAmount += 100; // 解説福田

    // ★ 修正: MVPと現地観戦を別々に加算
    if (isMvp) {
      addedAmount += 500; // MVPの金額（必要に応じて変更してください）
    }
    if (isOnSite) {
      addedAmount += 500; // 現地観戦の金額（必要に応じて変更してください）
    }
    // データベースに保存
    // (Savingsテーブルには合計金額のみ保存される仕様です)
    const matchDateObj = matchDate ? new Date(matchDate) : null;
    
    await prisma.savings.create({
      data: {
        season: season || '25/26',
        team: team.toLowerCase(),
        competition: competition.toLowerCase(),
        match_name: matchName,
        amount: addedAmount,
        match_date: matchDateObj,
      },
    });

    return NextResponse.json({
      message: '計算と保存が完了しました',
      addedAmount,
    });
  } catch (error) {
    console.error('計算エラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}