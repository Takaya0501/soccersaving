import Link from 'next/link';
import { TEAMS, PAST_SEASONS } from '@/lib/config';

export default function HomePage() {
  const euroTeams = TEAMS.filter(t => t.category === 'Europe');
  const jTeams = TEAMS.filter(t => t.category === 'J-League');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-10 text-gray-700">サッカー貯金</h1>

      {/* 欧州リーグ (25/26) */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl mb-8 border-l-8 border-blue-600">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">🇪🇺 25/26 Season</h2>
        <div className="grid grid-cols-1 gap-4">
          {euroTeams.map(team => (
            <Link 
              key={team.id} 
              href={`/${team.id}?season=${team.currentSeason}`}
              className="py-4 px-6 bg-blue-600 text-white font-bold text-center rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              {team.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Jリーグ (2026) - ガンバ大阪など */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl mb-8 border-l-8 border-black">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">🇯🇵 2026 Season</h2>
        <div className="grid grid-cols-1">
          {jTeams.map(team => (
            <Link 
              key={team.id} 
              href={`/${team.id}?season=${team.currentSeason}`}
              className="py-4 px-6 bg-black text-blue-400 font-bold text-center rounded-lg hover:bg-gray-900 transition shadow-md border border-blue-600"
            >
              {team.name}
            </Link>
          ))}
        </div>
      </div>

      {/* アーカイブ (過去シーズン) */}
      <div className="w-full max-w-xl text-center">
        <p className="text-gray-500 text-sm mb-2">Archives</p>
        <div className="flex justify-center space-x-4">
          {PAST_SEASONS.map(season => (
             // アーカイブページ等は別途作成、あるいは単純にシーズンパラメータを変えてリンクさせる
             <span key={season} className="text-gray-400">{season} (Coming Soon)</span>
          ))}
        </div>
      </div>
    </div>
  );
}