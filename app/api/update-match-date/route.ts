import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { id, matchDate } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'IDが必要です。' }, { status: 400 });
    }

    // 日付文字列をDateオブジェクトに変換（空ならnull）
    const dateObj = matchDate ? new Date(matchDate) : null;

    // Matchesテーブルを更新
    const updatedMatch = await prisma.matches.update({
      where: { id: Number(id) },
      data: { match_date: dateObj },
    });

    return NextResponse.json({ 
      message: '試合日を更新しました。', 
      match: updatedMatch 
    });
  } catch (error) {
    console.error('試合日の更新中にエラー:', error);
    return NextResponse.json({ message: '更新に失敗しました。' }, { status: 500 });
  }
}