import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const matches = await prisma.matches.findMany({
      orderBy: [
        { team: 'asc' },
        { competition: 'asc' },
        { match_name: 'asc' },
      ],
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('試合リストの取得中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}