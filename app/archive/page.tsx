import Link from 'next/link';
import { PAST_SEASONS, TEAMS } from '@/lib/config';

export default function ArchivePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="w-full max-w-xl mb-6">
        <Link href="/" className="text-blue-500 hover:underline">&lt; トップに戻る</Link>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-gray-700">過去のシーズン記録</h1>

      <div className="w-full max-w-xl space-y-6">
        {PAST_SEASONS.length === 0 ? (
          <p className="text-center text-gray-500">過去の記録はまだありません。</p>
        ) : (
          PAST_SEASONS.map(season => (
            <div key={season} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{season} シーズン</h2>
              <div className="grid grid-cols-2 gap-3">
                {TEAMS.map(team => (
                  <Link
                    key={team.id}
                    // 過去のシーズンを指定してチームページへ遷移
                    href={`/${team.id}?season=${season}`}
                    className="py-2 px-4 bg-gray-100 text-gray-700 font-medium text-center rounded hover:bg-gray-200 transition"
                  >
                    {team.name}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}