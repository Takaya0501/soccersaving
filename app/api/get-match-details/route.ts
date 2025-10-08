import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  const competition = searchParams.get('competition');
  const matchName = searchParams.get('matchName');

  if (!team || !competition || !matchName) {
    return NextResponse.json({ message: 'チーム、大会、試合名が指定されていません。' }, { status: 400 });
  }

  try {
    const db = await openDb();
    const matchDetails = await db.get(
      'SELECT * FROM matches WHERE team = ? AND competition = ? AND match_name = ?',
      team,
      competition,
      matchName
    );
    await db.close();

    if (!matchDetails) {
      return NextResponse.json({ message: '試合情報が見つかりません。' }, { status: 404 });
    }

    return NextResponse.json(matchDetails);
  } catch (error) {
    console.error('試合情報の取得中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}