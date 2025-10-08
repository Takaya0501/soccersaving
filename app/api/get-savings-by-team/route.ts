import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');

  if (!team) {
    return NextResponse.json({ message: 'チーム名が指定されていません。' }, { status: 400 });
  }

  try {
    const db = await openDb();
    const allSavings = await db.all('SELECT competition, SUM(amount) AS total FROM savings WHERE team = ? GROUP BY competition', team);
    await db.close();

    const result: { [key: string]: { total: number } } = {};
    allSavings.forEach(row => {
      result[row.competition] = { total: row.total };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('合計貯金額の取得に失敗しました:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}