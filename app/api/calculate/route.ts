import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        match_name: matchName,
      },
    });

    if (existingMatch) {
      return NextResponse.json({ message: 'この試合の記録は既に存在します。' }, { status: 409 });
    }
    
    const matchDetails = await prisma.matches.findUnique({
      where: {
        match_name: matchName,
      },
      select: {
        is_final: true,
      },
    });

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

    if (matchDetails && matchDetails.is_final === 1) {
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
        match_name: matchName,
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
    
    return NextResponse.json({
      message: '貯金が計算されました。',
      addedAmount: savingsAmount,
      currentSavings: totalSavingsResult._sum.amount || 0,
    });
  } catch (error) {
    console.error('貯金計算中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}