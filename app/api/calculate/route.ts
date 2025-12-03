import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const {
      season,
      team,
      competition,
      matchName,
      matchDate, // ✅ 1. 追加: フロントエンドから日付を受け取る
      matchResult,
      isOvertimeOrPK,
      isStarter,
      isFukudaCommentator,
      goals,
      assists,
      isMvp,
    } = await request.json();

    const currentSeason = season || '25/26';

    // 既存の重複チェック
    const existingMatch = await prisma.savings.findFirst({
      where: {
        team: team,
        competition: competition,
        match_name: matchName,
      },
    });

    if (existingMatch) {
      return NextResponse.json({ message: 'この試合の記録は既に存在します。' }, { status: 409 });
    }

    // 試合情報の取得（is_final のチェックには必要）
    // ※ ここで match_date を取得しても、Savingsの保存には使いません
    const matchInfo = await prisma.matches.findFirst({
      where: { 
        match_name: matchName,
        team: team,
        season: currentSeason,
      },
      select: { is_final: true }, // match_date は必須ではない
    });

    // ✅ 2. 修正: フォームから送られてきた日付を優先して Date 型に変換
    // フォームが空の場合は null にする
    const savingMatchDate = matchDate ? new Date(matchDate) : null;

    let savingsAmount = 0;
    
    switch (matchResult) {
      case 'win':
        savingsAmount += 500;
        break;
      case 'draw':
        savingsAmount += 200;
        break;
      case 'lose':
        savingsAmount += 100;
        break;
      default:
        break;
    }

    if (isOvertimeOrPK) {
      savingsAmount += 200;
    }

    if (isStarter) {
      savingsAmount += 200;
    }
    if (isFukudaCommentator) {
      savingsAmount += 500;
    }
    savingsAmount += goals * 500;
    savingsAmount += assists * 300;
    if (isMvp) {
      savingsAmount += 500;
    }

    if (matchInfo && matchInfo.is_final === 1) { 
      if (matchResult === 'win') {
        if (competition.includes('champions league') || competition.includes('europa league')) {
          savingsAmount += 10000;
        } else {
          savingsAmount += 5000;
        }
      } else if (matchResult === 'lose') {
        if (competition.includes('champions league') || competition.includes('europa league')) {
          savingsAmount += 7000;
        } else {
          savingsAmount += 3000;
        }
      }
    }

    await prisma.savings.create({
      data: {
        season: currentSeason,
        team: team,
        competition: competition,
        match_name: matchName,
        amount: savingsAmount,
        match_date: savingMatchDate, // ✅ 3. 修正: フォームの日付を使用
        timestamp: new Date().toISOString(),
      },
    });

    const totalSavingsResult = await prisma.savings.aggregate({
      where: { team: team, competition: competition },
      _sum: { amount: true },
    });

    return NextResponse.json({
      message: '貯金が計算されました。',
      addedAmount: savingsAmount,
      currentSavings: totalSavingsResult._sum.amount ?? 0,
    });
  } catch (error) {
    console.error('貯金計算中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}