import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント

export async function POST(request: Request) {
  try {
    const { team, competition, rank } = await request.json();

    const normalizedTeam = team.toLowerCase();
    const normalizedCompetition = competition.toLowerCase();

    let awardAmount = 0;

    // ... (計算ロジックは省略)

    if (awardAmount === 0) {
      return NextResponse.json({ message: '指定された順位と大会では貯金が発生しません。' }, { status: 400 });
    }

    const existingAward = await prisma.awards.findUnique({ // ✅ 修正: prisma.awards
      where: {
        // ✅ 修正: スネークケースの複合キーに修正
        team_competition: {
          team: normalizedTeam,
          competition: normalizedCompetition,
        },
      },
    });

    if (existingAward) {
      return NextResponse.json({ message: 'このチームのこの大会の順位は既に記録済みです。' }, { status: 409 });
    }

    await prisma.awards.create({ // ✅ 修正: prisma.awards
      data: {
        team: normalizedTeam,
        competition: normalizedCompetition,
        rank: rank,
        amount: awardAmount,
      },
    });

    await prisma.savings.create({ // ✅ 修正: prisma.savings
      data: {
        team: normalizedTeam,
        competition: normalizedCompetition,
        match_name: `Rank ${rank}`, // ✅ 修正: match_name
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
