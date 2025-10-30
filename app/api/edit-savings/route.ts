import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント

// POST: 既存の貯金レコードの金額を更新
export async function POST(request: Request) {
  try {
    const { id, amount, matchDate } = await request.json(); // matchDate を追加

    if (typeof id !== 'number' || typeof amount !== 'number') {
        return NextResponse.json({ message: 'IDまたは金額が無効です。' }, { status: 400 });
    }

    // matchDate のバリデーションと変換
    let matchDateObj = null;
    if (matchDate) {
        matchDateObj = new Date(matchDate);
        if (isNaN(matchDateObj.getTime())) {
            return NextResponse.json({ message: '試合日の形式が無効です。' }, { status: 400 });
        }
    } // <-- ここにあった余分な閉じ括弧を削除しました

    // Savingsモデル（複数形）を使用
    const updatedSaving = await prisma.savings.update({
      where: { id: id },
      data: {
          amount: amount,
          match_date: matchDateObj // 試合日を更新
      },
    });
    
    // 成功時に更新されたレコードを返す
    return NextResponse.json({ 
      message: '貯金額を更新しました。',
      updatedSaving: updatedSaving
    });
  } catch (error) {
    // Prismaのエラーコードをチェック
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
       return NextResponse.json({ message: '対象の試合記録が見つかりません。' }, { status: 404 });
    }
    console.error('貯金額の更新中にエラー:', error);
    return NextResponse.json({ message: '貯金額の更新に失敗しました。' }, { status: 500 });
  }
}

// DELETE: 既存の貯金レコードを削除
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (typeof id !== 'number') {
        return NextResponse.json({ message: 'IDが無効です。' }, { status: 400 });
    }

    // Savingsモデル（複数形）を使用
    await prisma.savings.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ message: '試合データを削除しました。' });
  } catch (error) {
    // Prismaのエラーコードをチェック
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
       return NextResponse.json({ message: '対象の試合記録が見つかりません。' }, { status: 404 });
    }
    console.error('試合データの削除中にエラー:', error);
    return NextResponse.json({ message: '試合データの削除に失敗しました。' }, { status: 500 });
  }
}
