import Link from 'next/link';
import { openDb } from '@/lib/db';

interface SavingsSummary {
  team: string;
  competition: string;
  total: number;
}

async function getAllSavingsSummary(): Promise<SavingsSummary[]> {
  try {
    const db = await openDb();
    const savings = await db.all('SELECT team, competition, SUM(amount) AS total FROM savings GROUP BY team, competition');
    await db.close();
    return savings as SavingsSummary[];
  } catch (error) {
    console.error('トップページでのデータ取得に失敗しました:', error);
    return [];
  }
}

export default async function HomePage() {
  const teams = ['Liverpool', 'Dortmund', 'Barcelona'];
  const allSavingsSummary = await getAllSavingsSummary();

  const teamTotals: { [key: string]: number } = {};
  teams.forEach(team => {
    teamTotals[team.toLowerCase()] = 0;
  });
  allSavingsSummary.forEach(item => {
    if (teamTotals[item.team.toLowerCase()] !== undefined) {
      teamTotals[item.team.toLowerCase()] += item.total;
    }
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">25/26 欧州サッカー貯金</h1>

      {allSavingsSummary.length === 0 && (
        <p className="mb-6 text-red-500 font-semibold">
          **エラー: データが参照できません。データベースにデータが存在しないか、接続エラーが発生しています。**
        </p>
      )}

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-6">チームを選択</h2>
        <nav className="flex flex-col space-y-4">
          {teams.map(team => (
            <Link key={team} href={`/${team.toLowerCase()}`} className="py-3 px-4 bg-blue-600 text-white font-bold text-center rounded-md hover:bg-blue-700 transition duration-300">
              {team}
              {teamTotals[team.toLowerCase()] !== undefined && (
                <span className="ml-2 font-normal">({teamTotals[team.toLowerCase()]}円)</span>
              )}
            </Link>
          ))}
          <Link href="/add-award" className="py-3 px-4 bg-purple-600 text-white font-bold text-center rounded-md hover:bg-purple-700 transition duration-300">
            順位を記録
          </Link>
        </nav>
      </div>

      <div className="mt-8 bg-gray-200 p-6 rounded-lg w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-4">管理画面</h2>
        <div className="flex flex-col space-y-2">
            <Link href="/add-match" className="text-gray-700 hover:text-gray-900 hover:underline">
              → 個別の試合を追加
            </Link>
            <Link href="/bulk-add-matches" className="text-gray-700 hover:text-gray-900 hover:underline">
              → まとめて試合を追加 (JSON)
            </Link>
        </div>
      </div>
    </div>
  );
}