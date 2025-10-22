import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, amount } = await request.json();
    await prisma.savings.update({
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
    await prisma.savings.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: '試合データを削除しました。' });
  } catch (error) {
    console.error('試合データの削除中にエラー:', error);
    return NextResponse.json({ message: '試合データの削除に失敗しました。' }, { status: 500 });
  }
}