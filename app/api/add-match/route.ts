import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { team, competition, matchName, matchDate, isOvertimeOrPK, isFinal } = await request.json(); // matchDate を追加

    if (!team || !competition || !matchName) {
      return NextResponse.json({ message: 'チーム、大会、試合名を指定してください。' }, { status: 400 });
    }

    const normalizedMatchName = matchName.toLowerCase();
    const normalizedTeam = team.toLowerCase();
    const normalizedCompetition = competition.toLowerCase();

    try {
      // ✅ 修正: prisma.matches (複数形)を使用
      const newMatch = await prisma.matches.create({ 
        data: {
          team: normalizedTeam,
          competition: normalizedCompetition,
          match_name: normalizedMatchName, // ✅ 修正: match_name
          match_date: matchDate, // matchDate を追加
          is_overtime_or_pk: isOvertimeOrPK ? 1 : 0, // ✅ 修正: is_overtime_or_pk
          is_final: isFinal ? 1 : 0, // ✅ 修正: is_final
        },
      });

      return NextResponse.json({
        message: `試合 "${matchName}" が追加されました。`,
        match: newMatch,
      });
    } catch (error) { // ✅ 修正: error: any を削除
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: 'この試合名は既に存在します。' }, { status: 409 });
      }
      console.error('試合の追加中にPrismaエラー:', error);
      return NextResponse.json({ message: '試合の追加に失敗しました。' }, { status: 500 });
    }
  } catch (error) {
    console.error('試合の追加中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}