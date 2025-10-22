import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント

export async function POST(request: Request) {
  try {
    const {
      team,
      competition,
      matchName,
      matchResult,
      isOvertimeOrPK,
      isStarter,
      isFukudaCommentator,
      goals,
      assists,
      isMvp,
    } = await request.json();

    const existingMatch = await prisma.savings.findFirst({
      where: {
        team: team,
        competition: competition,
        match_name: matchName, // ✅ 修正: match_name
      },
    });

    if (existingMatch) {
      return NextResponse.json({ message: 'この試合の記録は既に存在します。' }, { status: 409 });
    }
    
    // PrismaスキーマのMatchesモデル（データベースではmatchesテーブル）を参照
    const matchDetails = await prisma.matches.findUnique({ // ✅ 修正: prisma.matches
      where: {
        match_name: matchName, // ✅ 修正: match_name
      },
      select: {
        is_final: true, // ✅ 修正: is_final
      },
    });

    let savingsAmount = 0;
    
    // ... (計算ロジックは省略)

    if (matchDetails && matchDetails.is_final === 1) { // データベースの型がInt(1)なので比較を維持
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
        team: team,
        competition: competition,
        match_name: matchName, // ✅ 修正: match_name
        amount: savingsAmount,
        timestamp: new Date(),
      },
    });

    const totalSavingsResult = await prisma.savings.aggregate({
      where: {
        team: team,
        competition: competition,
      },
      _sum: {
        amount: true,
      },
    });
    
    // ... (レスポンスロジックは省略)
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
