import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ matchの型を明示的に定義
interface Match {
  team: string;
  competition: string;
  matchName: string;
  is_overtime_or_pk?: boolean;
  is_final?: boolean;
}

export async function POST(request: Request) {
  try {
    const { matches } = await request.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json({ message: '有効な試合データの配列を送信してください。' }, { status: 400 });
    }

    const transaction = await prisma.$transaction(
      // ✅ mapの引数に型を指定
      matches.map((match: Match) => {
        const { team, competition, matchName, is_overtime_or_pk, is_final } = match;

        return prisma.matches.upsert({
          where: { match_name: matchName.toLowerCase() },
          update: {
            team: team.toLowerCase(),
            competition: competition.toLowerCase(),
            is_overtime_or_pk: is_overtime_or_pk ? 1 : 0,
            is_final: is_final ? 1 : 0,
          },
          create: {
            team: team.toLowerCase(),
            competition: competition.toLowerCase(),
            match_name: matchName.toLowerCase(),
            is_overtime_or_pk: is_overtime_or_pk ? 1 : 0,
            is_final: is_final ? 1 : 0,
          },
        });
      })
    );

    return NextResponse.json({
      message: `${transaction.length}件の試合が追加または更新されました。`,
      addedCount: transaction.length,
      skippedCount: 0
    });
  } catch (error: any) {
    console.error('一括追加中にエラー:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: '一部の試合はすでに存在するためスキップされました。' }, { status: 409 });
    }
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}