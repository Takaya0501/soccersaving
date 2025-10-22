import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント

export async function POST(request: Request) {
  try {
    const { id, amount } = await request.json();

    if (typeof id !== 'number' || typeof amount !== 'number') {
        return NextResponse.json({ message: 'IDまたは金額が無効です。' }, { status: 400 });
    }

    await prisma.savings.update({ // ✅ 修正: prisma.savings
      where: { id: id },
      data: { amount: amount },
    });
    return NextResponse.json({ message: '貯金額を更新しました。' });
  } catch (error) {
    console.error('貯金額の更新中にエラー:', error);
    return NextResponse.json({ message: '貯金額の更新に失敗しました。' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (typeof id !== 'number') {
        return NextResponse.json({ message: 'IDが無効です。' }, { status: 400 });
    }

    await prisma.savings.delete({ // ✅ 修正: prisma.savings
      where: { id: id },
    });
    return NextResponse.json({ message: '試合データを削除しました。' });
  } catch (error) {
    console.error('試合データの削除中にエラー:', error);
    return NextResponse.json({ message: '試合データの削除に失敗しました。' }, { status: 500 });
  }
}
