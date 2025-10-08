'use client';

import Link from 'next/link';
import { useState } from 'react';
import SavingForm from './components/SavingForm';

interface TeamSavings {
  [competition: string]: { total: number };
}

interface TeamClientPageProps {
  teamName: string;
  teamSavings: TeamSavings;
}

const teamCompetitions: { [key: string]: string[] } = {
  'liverpool': ['premier league', 'fa cup', 'carabao cup', 'uefa champions league', 'fa community shield'],
  'dortmund': ['bundesliga', 'dfb-pokal', 'uefa champions league'],
  'barcelona': ['la liga', 'copa del rey', 'uefa champions league', 'supercopa de españa']
};

export default function TeamClientPage({ teamName, teamSavings }: TeamClientPageProps) {
  const [currentTeamSavings, setCurrentTeamSavings] = useState(teamSavings);
  
  const totalTeamSavings = Object.values(currentTeamSavings).reduce((sum, comp) => sum + comp.total, 0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="flex justify-between w-full max-w-xl mb-4">
        <Link href={`/`} className="text-blue-500 hover:underline">
          &lt; チーム一覧に戻る
        </Link>
        <Link href={`/${teamName}/history`} className="text-blue-500 hover:underline">
          試合履歴 &gt;
        </Link>
      </div>

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
      
      <SavingForm teamName={teamName} setTeamSavings={setCurrentTeamSavings} teamSavings={currentTeamSavings} />
    </div>
  );
}