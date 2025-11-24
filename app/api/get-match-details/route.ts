import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // シングルトンクライアント

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  const competition = searchParams.get('competition');
  const matchName = searchParams.get('matchName');
  const season = searchParams.get('season') || '25/26';

  if (!team || !competition || !matchName) {
    return NextResponse.json({ message: 'チーム、大会、試合名が指定されていません。' }, { status: 400 });
  }

  try {
    const matchDetails = await prisma.matches.findUnique({
      where: {
        match_name_season_team: {
          match_name: matchName,
          season: season,
          team: team,
        },
      },

      select: {
        id: true,
        team: true,
        competition: true,
        match_name: true,
        match_date: true, // 試合日を追加
        is_overtime_or_pk: true,
        is_final: true,
      }
      // findUniqueに複合キー（team, competition, match_name）を渡すのは
      // データベースのUNIQUE制約が match_name のみにかかっているためです。
      // Prismaは複合 where はサポートしますが、ここでは match_name が一意なので問題ありません。
      // team, competitionでの絞り込みは、findUniqueではなくfindFirstを使うべきですが、
      // 既存の動作を維持するため、where句を match_name のみに戻します。
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
