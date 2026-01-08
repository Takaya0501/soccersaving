import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { team, competition, matchName, matchDate, isFinal, season } = body;

    // バリデーション
    if (!team || !competition || !matchName) {
      return NextResponse.json(
        { message: 'チーム、大会、試合名は必須です。' },
        { status: 400 }
      );
    }

    const currentSeason = season || '25/26';

    // ★修正ポイント: findUnique ではなく findFirst を使うか、複合キーで検索する
    // 旧: where: { match_name: matchName } -> これはエラーになる
    // 新: チーム・シーズン・試合名で重複チェック
    const existingMatch = await prisma.matches.findFirst({
      where: {
        team: team,
        season: currentSeason,
        match_name: matchName,
      },
    });

    if (existingMatch) {
      return NextResponse.json(
        { message: 'この試合は既に追加されています。' },
        { status: 409 }
      );
    }

    // 日付の変換
    const dateObj = matchDate ? new Date(matchDate) : null;

    // データの作成
    const newMatch = await prisma.matches.create({
      data: {
        season: currentSeason,
        team: team,
        competition: competition,
        match_name: matchName,
        match_date: dateObj,
        is_final: isFinal ? 1 : 0, // booleanできた場合は数値に変換
      },
    });

    return NextResponse.json({
      message: '試合を追加しました',
      match: newMatch,
    });
  } catch (error) {
    console.error('試合追加エラー:', error);
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}