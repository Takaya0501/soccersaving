import Link from 'next/link';
import prisma from '@/lib/prisma';
import { PAST_SEASONS } from '@/lib/config';

export default async function SavedMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season } = await searchParams;
  // デフォルトは '25/26' ですが、リンクから 2026 が指定されればそれが使われます
  const currentSeason = season || '25/26';

  const savings = await prisma.savings.findMany({
    where: {
      season: currentSeason,
    },
    orderBy: {
      match_date: 'desc',
    },
  });

  // 日付ソート
  savings.sort((a, b) => {
    const dateA = a.match_date ? new Date(a.match_date).getTime() : new Date(a.timestamp).getTime();
    const dateB = b.match_date ? new Date(b.match_date).getTime() : new Date(b.timestamp).getTime();
    return dateB - dateA;
  });

  const totalAmount = savings.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <Link href="/" className="text-blue-500 hover:underline">
          &lt; トップに戻る
        </Link>
        
        {/* シーズン切り替えリンク */}
        <div className="flex space-x-2 text-sm">
           {/* ✅ 追加: 2026シーズン (ガンバ大阪用) */}
           <Link 
            href="/saved-matches?season=2026" 
            className={`px-3 py-1 rounded ${currentSeason === '2026' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            2026
          </Link>

          <Link 
            href="/saved-matches?season=25/26" 
            className={`px-3 py-1 rounded ${currentSeason === '25/26' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            25/26
          </Link>
          <Link 
            href="/saved-matches?season=2025" 
            className={`px-3 py-1 rounded ${currentSeason === '2025' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            2025
          </Link>
          {PAST_SEASONS.map(s => (
             <Link 
             key={s}
             href={`/saved-matches?season=${s}`} 
             className={`px-3 py-1 rounded ${currentSeason === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
           >
             {s}
           </Link>
          ))}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-gray-700">記録済み試合一覧 ({currentSeason})</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-4xl flex justify-between items-center">
        <span className="text-xl font-bold text-gray-600">シーズン合計:</span>
        <span className="text-4xl font-bold text-blue-600">{totalAmount.toLocaleString()}円</span>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow overflow-hidden">
        {savings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            このシーズンの記録はまだありません。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                  <th className="p-4 whitespace-nowrap">日付</th>
                  <th className="p-4 whitespace-nowrap">チーム</th>
                  <th className="p-4 whitespace-nowrap">大会</th>
                  <th className="p-4 w-full">試合名</th>
                  <th className="p-4 whitespace-nowrap text-right">金額</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {savings.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 whitespace-nowrap">
                      {item.match_date 
                        ? new Date(item.match_date).toLocaleDateString() 
                        : <span className="text-gray-400 text-xs">未設定</span>}
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold capitalize">
                      {item.team === 'gamba osaka' ? 'Gamba Osaka' : item.team}
                    </td>
                    <td className="p-4 whitespace-nowrap capitalize">
                      {item.competition}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {item.match_name}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right font-bold text-green-600">
                      +{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}