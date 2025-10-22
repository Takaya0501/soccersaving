import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント

export async function POST(request: Request) {
  try {
    const { team, competition, rank } = await request.json();

    const normalizedTeam = team.toLowerCase();
    const normalizedCompetition = competition.toLowerCase();

    // ✅ prefer-constエラーを解消するため、IIFEでawardAmountを計算
    const awardAmount = (() => {
        let amount = 0;
        if (normalizedCompetition.includes('champions league') || normalizedCompetition.includes('europa league')) {
            if (rank === 1) {
                amount = 10000;
            } else if (rank === 2) {
                amount = 7000;
            }
        } else if (normalizedCompetition.includes('league') || normalizedCompetition.includes('cup') || normalizedCompetition.includes('shield')) {
            if (rank === 1) {
                amount = 5000;
            } else if (rank === 2) {
                amount = 3000;
            }
        }
        
        // リーグ3位のボーナス（他のボーナスと排他でないと仮定）
        // NOTE: 元のロジックでは他のボーナスを上書きする構造だったため、元のロジックを再現する
        if (normalizedCompetition.includes('league') && rank === 3) {
            amount = 2000;
        }
        return amount;
    })();


    if (awardAmount === 0) {
      return NextResponse.json({ message: '指定された順位と大会では貯金が発生しません。' }, { status: 400 });
    }

    const existingAward = await prisma.awards.findUnique({
      where: {
        team_competition: {
          team: normalizedTeam,
          competition: normalizedCompetition,
        },
      },
    });

    if (existingAward) {
      return NextResponse.json({ message: 'このチームのこの大会の順位は既に記録済みです。' }, { status: 409 });
    }

    await prisma.awards.create({
      data: {
        team: normalizedTeam,
        competition: normalizedCompetition,
        rank: rank,
        amount: awardAmount,
      },
    });

    await prisma.savings.create({
      data: {
        team: normalizedTeam,
        competition: normalizedCompetition,
        match_name: `Rank ${rank}`,
        amount: awardAmount,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      message: `${team}の${competition}での${rank}位が記録されました。`,
      addedAmount: awardAmount
    });
  } catch (error) {
    console.error('順位による貯金加算中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}