import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  const competition = searchParams.get('competition');
  const matchName = searchParams.get('matchName');

  if (!team || !competition || !matchName) {
    return NextResponse.json({ message: 'チーム、大会、試合名が指定されていません。' }, { status: 400 });
  }

  try {
    const matchDetails = await prisma.matches.findUnique({
      where: {
        match_name: matchName,
        team: team,
        competition: competition
      }
    });

    if (!matchDetails) {
      return NextResponse.json({ message: '試合情報が見つかりません。' }, { status: 404 });
    }

    return NextResponse.json(matchDetails);
  } catch (error) {
    console.error('試合情報の取得中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}