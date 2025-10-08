import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { matches } = await request.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json({ message: '有効な試合データの配列を送信してください。' }, { status: 400 });
    }

    const db = await openDb();

    await db.run('BEGIN TRANSACTION');

    const stmt = await db.prepare(
      'INSERT INTO matches (team, competition, match_name, is_overtime_or_pk, is_final) VALUES (?, ?, ?, ?, ?)'
    );

    let addedCount = 0;
    let skippedCount = 0;

    for (const match of matches) {
      const { team, competition, match_name, is_overtime_or_pk, is_final } = match;

      if (!team || !competition || !match_name) {
        skippedCount++;
        continue;
      }

      const existingEntry = await db.get(
        'SELECT id FROM matches WHERE team = ? AND competition = ? AND match_name = ?',
        team.toLowerCase(),
        competition.toLowerCase(),
        match_name.toLowerCase()
      );

      if (existingEntry) {
        skippedCount++;
        continue;
      }

      const isOvertimeOrPK = is_overtime_or_pk ? 1 : 0;
      const isFinal = is_final ? 1 : 0;

      await stmt.run(team.toLowerCase(), competition.toLowerCase(), match_name.toLowerCase(), isOvertimeOrPK, isFinal);
      addedCount++;
    }

    await stmt.finalize();

    await db.run('COMMIT');
    await db.close();

    return NextResponse.json({
      message: `${addedCount}件の試合が追加されました。${skippedCount}件はスキップされました（重複または無効なデータ）。`,
      addedCount,
      skippedCount
    });
  } catch (error) {
    console.error('一括追加中にエラー:', error);

    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}