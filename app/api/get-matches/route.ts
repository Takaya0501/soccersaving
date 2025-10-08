import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const matches = await db.all('SELECT * FROM matches ORDER BY team, competition, match_name');
    await db.close();

    return NextResponse.json(matches);
  } catch (error) {
    console.error('試合リストの取得中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}