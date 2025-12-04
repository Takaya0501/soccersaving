import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ✅ 追加: このAPIを常に動的に実行する（キャッシュしない）設定
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  // シーズン指定がない場合はデフォルト値を使用
  const season = searchParams.get('season') || '25/26';

  if (!team) {
    return NextResponse.json({ message: 'チーム名が指定されていません。' }, { status: 400 });
  }

  try {
    // 指定されたチーム・シーズンの記録済みデータを取得
    const savedMatches = await prisma.savings.findMany({
      where: {
        team: team,
        season: season,
      },
      select: {
        match_name: true,
      },
    });

    // 試合名の配列にして返す
    const matchNames = savedMatches.map((m) => m.match_name);

    return NextResponse.json(matchNames);
  } catch (error) {
    console.error('保存済み試合の取得中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}