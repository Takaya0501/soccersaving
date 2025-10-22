import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント
import type { Savings } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');

  if (!team) {
    return NextResponse.json({ message: 'チーム名が指定されていません。' }, { status: 400 });
  }

  try {
    const allSavings = await prisma.savings.groupBy({
      by: ['competition'],
      _sum: { amount: true },
      where: { team: team },
    });

    const result: { [key: string]: { total: number } } = {};
    allSavings.forEach(row => {
      if (row.competition) {
        // ✅ 修正: row._sum.amount ?? 0 を使用して null を安全に扱う
        result[row.competition] = { total: row._sum.amount ?? 0 };
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('合計貯金額の取得に失敗しました:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
