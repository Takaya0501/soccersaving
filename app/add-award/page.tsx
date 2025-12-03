'use client';

import { useState } from 'react';
import Link from 'next/link';

const teams = ['Liverpool', 'Dortmund', 'Barcelona', 'Gamba Osaka'];
const teamCompetitions: { [key: string]: string[] } = {
  'liverpool': ['premier league', 'fa cup', 'carabao cup', 'uefa champions league', 'fa community shield'],
  'dortmund': ['bundesliga', 'dfb-pokal', 'uefa champions league'],
  'barcelona': ['la liga', 'copa del rey', 'uefa champions league', 'supercopa de españa'],
  'gamba osaka': ['j1 league', 'emperors cup', 'j league cup']
};

const ranks = [1, 2, 3];

export default function AddAwardPage() {
  const [status, setStatus] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const team = e.target.value;
    setSelectedTeam(team);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('送信中...');

    const form = e.currentTarget;
    const team = form.team.value;
    const competition = form.competition.value;
    const rank = parseInt(form.rank.value, 10);

    try {
      const response = await fetch('/api/award-savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team, competition, rank }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`成功: ${team}が${competition}で${rank}位になりました！`);
      } else {
        setStatus(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error('順位の追加中にエラー:', error);
      setStatus('順位の追加に失敗しました。');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="flex justify-between w-full max-w-xl mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          &lt; トップに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-gray-700">順位の追加</h1>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">チーム:</label>
            <select id="team" name="team" required 
                    className="w-full p-3 border border-gray-300 rounded-md"
                    onChange={handleTeamChange}>
              <option value="">選択してください</option>
              {teams.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="competition" className="block text-sm font-medium text-gray-700 mb-2">大会:</label>
            <select id="competition" name="competition" required 
                    className="w-full p-3 border border-gray-300 rounded-md"
                    disabled={!selectedTeam}>
              <option value="">選択してください</option>
              {selectedTeam && teamCompetitions[selectedTeam] && teamCompetitions[selectedTeam].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-2">順位:</label>
            <select id="rank" name="rank" required className="w-full p-3 border border-gray-300 rounded-md">
              <option value="">選択してください</option>
              {ranks.map(r => <option key={r} value={r}>{r}位</option>)}
            </select>
          </div>
          
          <button type="submit" className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition duration-300">
            順位を記録
          </button>
        </form>
        {status && <p className="mt-4 text-center text-sm font-bold">{status}</p>}
      </div>
    </div>
  );
}