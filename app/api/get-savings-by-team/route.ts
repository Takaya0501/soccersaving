import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import type { Savings } from '@prisma/client'; // ❌ 削除

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  const season = searchParams.get('season'); // シーズンを受け取る

  if (!team || !season) { // シーズンも必須にする
    return NextResponse.json({ message: 'チームとシーズンが必要です。' }, { status: 400 });
  }

  try {
    const allSavings = await prisma.savings.groupBy({
      by: ['competition'],
      _sum: { amount: true },
      where: { 
        team: team,
        season: season // シーズンで絞り込み
      },
    });

    const result: { [key: string]: { total: number } } = {};
    allSavings.forEach(row => {
      if (row.competition) {
        result[row.competition] = { total: row._sum.amount ?? 0 };
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('合計貯金額の取得に失敗しました:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}