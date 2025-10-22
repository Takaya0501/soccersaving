import Link from 'next/link';

export default function HomePage() {
  const teams = ['Liverpool', 'Dortmund', 'Barcelona'];
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">25/26 欧州サッカー貯金</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-6">チームを選択</h2>
        <nav className="flex flex-col space-y-4">
          {teams.map(team => (
            <Link key={team} href={`/${team.toLowerCase()}`} className="py-3 px-4 bg-blue-600 text-white font-bold text-center rounded-md hover:bg-blue-700 transition duration-300">
              {team}
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