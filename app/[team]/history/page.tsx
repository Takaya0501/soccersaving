import Link from 'next/link';
import { openDb } from '@/lib/db';
import MatchHistoryClientPage from './MatchHistoryClientPage';

interface MatchSaving {
  id: number;
  team: string;
  competition: string;
  match_name: string;
  amount: number;
  timestamp: string;
  is_final: boolean; // ✅ 追加
  is_overtime_or_pk: boolean; // ✅ 追加
}

export default async function MatchHistoryPage({ params }: { params: { team: string } }) {
  const teamName = params.team;
  let matches: MatchSaving[] = [];

  try {
    const db = await openDb();
    matches = await db.all('SELECT * FROM savings WHERE team = ? ORDER BY timestamp DESC', teamName);
    await db.close();
  } catch (error) {
    console.error('試合履歴の取得に失敗しました:', error);
  }

  return <MatchHistoryClientPage matches={matches} teamName={teamName} />;
}