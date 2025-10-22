import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // ✅ オブジェクトの型を明示的に定義
    const result: { [key: string]: { total: number } } = {};
    allSavings.forEach(row => {
      if (row.competition) {
        // ✅ _sum.amount が null になる可能性を考慮
        result[row.competition] = { total: row._sum.amount ?? 0 };
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('合計貯金額の取得に失敗しました:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}