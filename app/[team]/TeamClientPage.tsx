'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react'; // ✅ useEffectを追加
import { useRouter } from 'next/navigation'; // ✅ useRouterを追加
import SavingForm from './components/SavingForm';

interface TeamSavings {
  [competition: string]: { total: number };
}

interface TeamClientPageProps {
  teamName: string;
  teamSavings: TeamSavings;
  currentSeason: string; 
}

const teamCompetitions: { [key: string]: string[] } = {
  'liverpool': ['premier league', 'fa cup', 'carabao cup', 'uefa champions league', 'fa community shield'],
  'dortmund': ['bundesliga', 'dfb-pokal', 'uefa champions league'],
  'barcelona': ['la liga', 'copa del rey', 'uefa champions league', 'supercopa de españa'],
  'gamba osaka': ['j1 league', 'emperors cup', 'j league cup']
};

export default function TeamClientPage({ teamName, teamSavings, currentSeason }: TeamClientPageProps) {
  const router = useRouter(); // ✅ ルーターの初期化
  const [currentTeamSavings, setCurrentTeamSavings] = useState(teamSavings);
  
  // ✅ サーバー側でデータ（teamSavings）が変わった時にStateを更新する処理
  useEffect(() => {
    setCurrentTeamSavings(teamSavings);
  }, [teamSavings]);

  const totalTeamSavings = Object.values(currentTeamSavings).reduce((sum, comp) => sum + comp.total, 0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="flex justify-between w-full max-w-xl mb-4">
        <Link href={`/`} className="text-blue-500 hover:underline">
          &lt; チーム一覧に戻る
        </Link>
        {/* 履歴ページにも season を引き継ぐ */}
        <Link href={`/${teamName}/history?season=${currentSeason}`} className="text-blue-500 hover:underline">
          試合履歴 &gt;
        </Link>
      </div>

      {/* ✅ タイトルとシーズン選択プルダウンを横並びに配置 */}
      <h1 className="text-3xl font-bold mb-2 text-gray-700 capitalize">{teamName}</h1>
      <p className="text-gray-500 mb-8 font-medium">Season: {currentSeason}</p>

      <h1 className="text-3xl font-bold mb-8 text-gray-700">{teamName} 貯金額</h1>

      <div className="bg-blue-200 p-6 rounded-lg shadow-md mb-8 w-full max-w-xl text-center">
        <p className="text-xl font-bold">合計貯金額:</p>
        <p className="text-4xl font-bold text-blue-800">{totalTeamSavings}円</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-xl text-center">
        <h2 className="text-xl font-bold mb-4">大会別貯金額</h2>
        <div className="flex justify-around mt-2">
          {teamCompetitions[teamName]?.map((comp) => (
            <div key={comp} className="text-center">
              <p className="font-medium">{comp}</p>
              <p className="text-2xl font-bold text-green-600">
                {currentTeamSavings[comp]?.total || 0}円
              </p>
            </div>
          ))}
        </div>
    </div>
      <SavingForm teamName={teamName} setTeamSavings={setCurrentTeamSavings} teamSavings={currentTeamSavings} season={currentSeason}/>
    </div>
  );
}