import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 修正: null の場合はデフォルト値 '25/26' を使う
  const season = searchParams.get('season') || '25/26';
  try {
    const matches = await prisma.matches.findMany({
      where: {
        season: season, // これでエラーが解消されます
      },
      orderBy: [
        { team: 'asc' },
        { competition: 'asc' },
        { match_name: 'asc' }, // ✅ 修正: match_name
      ],
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('試合リストの取得中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
