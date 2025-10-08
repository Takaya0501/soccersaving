import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { team, competition, rank } = await request.json();

    const normalizedTeam = team.toLowerCase();
    const normalizedCompetition = competition.toLowerCase();

    let awardAmount = 0;

    if (normalizedCompetition.includes('league') || normalizedCompetition.includes('cup') || normalizedCompetition.includes('shield')) {
      if (rank === 1) {
        awardAmount = 5000;
      } else if (rank === 2) {
        awardAmount = 3000;
      }
    }
    
    if (normalizedCompetition.includes('champions league') || normalizedCompetition.includes('europa league')) {
      if (rank === 1) {
        awardAmount = 10000;
      } else if (rank === 2) {
        awardAmount = 7000;
      }
    }
    
    if (normalizedCompetition.includes('league') && rank === 3) {
      awardAmount = 2000;
    }


    if (awardAmount === 0) {
      return NextResponse.json({ message: '指定された順位と大会では貯金が発生しません。' }, { status: 400 });
    }

    const db = await openDb();

    const existingAward = await db.get(
      'SELECT id FROM awards WHERE team = ? AND competition = ?',
      normalizedTeam,
      normalizedCompetition
    );

    if (existingAward) {
      await db.close();
      return NextResponse.json({ message: 'このチームのこの大会の順位は既に記録済みです。' }, { status: 409 });
    }

    await db.run(
      'INSERT INTO awards (team, competition, rank, amount) VALUES (?, ?, ?, ?)',
      normalizedTeam,
      normalizedCompetition,
      rank,
      awardAmount
    );

    await db.run(
      'INSERT INTO savings (team, competition, match_name, amount, timestamp) VALUES (?, ?, ?, ?, ?)',
      normalizedTeam,
      normalizedCompetition,
      `Rank ${rank}`,
      awardAmount,
      new Date().toISOString()
    );

    await db.close();

    return NextResponse.json({
      message: `${team}の${competition}での${rank}位が記録されました。`,
      addedAmount: awardAmount
    });
  } catch (error) {
    console.error('順位による貯金加算中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}