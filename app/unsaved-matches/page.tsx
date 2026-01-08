import Link from 'next/link';
import prisma from '@/lib/prisma';
import { PAST_SEASONS } from '@/lib/config';
import UnsavedMatchRow from './UnsavedMatchRow';

export default async function UnsavedMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season } = await searchParams;
  const currentSeason = season || '25/26';

  const allMatches = await prisma.matches.findMany({
    where: { season: currentSeason },
    orderBy: { match_date: 'asc' },
  });

  const savedMatches = await prisma.savings.findMany({
    where: { season: currentSeason },
    select: { team: true, match_name: true },
  });

  const savedKeys = new Set(
    savedMatches.map((s) => `${s.team.toLowerCase()}_${s.match_name.toLowerCase().trim()}`)
  );

  const unsavedMatches = allMatches.filter((match) => {
    const key = `${match.team.toLowerCase()}_${match.match_name.toLowerCase().trim()}`;
    return !savedKeys.has(key);
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <Link href="/" className="text-blue-500 hover:underline">
          &lt; トップに戻る
        </Link>
        <div className="flex space-x-2 text-sm">
          {/* ✅ 追加: 2026シーズン */}
          <Link href="/unsaved-matches?season=2026" className={`px-3 py-1 rounded ${currentSeason === '2026' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>2026</Link>
          
          <Link href="/unsaved-matches?season=25/26" className={`px-3 py-1 rounded ${currentSeason === '25/26' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>25/26</Link>
          <Link href="/unsaved-matches?season=2025" className={`px-3 py-1 rounded ${currentSeason === '2025' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>2025</Link>
          {PAST_SEASONS.map((s) => (
            <Link key={s} href={`/unsaved-matches?season=${s}`} className={`px-3 py-1 rounded ${currentSeason === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{s}</Link>
          ))}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-gray-700">未記録の試合 ({currentSeason})</h1>
      {/* ... (以下省略、変更なし) ... */}
      <p className="text-gray-500 mb-8">
        日付を変更すると自動保存されます。
        <br />
        <span className="text-xs">※合計 {unsavedMatches.length} 件</span>
      </p>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow overflow-hidden">
        {unsavedMatches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            未記録の試合はありません。すべて記録済みです！🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                  <th className="p-4 whitespace-nowrap w-40">日付</th>
                  <th className="p-4 whitespace-nowrap">チーム</th>
                  <th className="p-4 whitespace-nowrap">大会</th>
                  <th className="p-4 w-full">試合名</th>
                  <th className="p-4 whitespace-nowrap text-center">操作</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {unsavedMatches.map((match) => (
                  <UnsavedMatchRow 
                    key={match.id} 
                    match={{
                      ...match,
                      match_date: match.match_date ? match.match_date.toISOString() : null
                    }} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}