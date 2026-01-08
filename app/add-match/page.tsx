'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TEAMS } from '@/lib/config'; // ✅ 追加: 全体設定をインポート

// 大会リストの設定（キーはTEAMSのidと一致させる）
const teamCompetitions: { [key: string]: string[] } = {
  'liverpool': ['premier league', 'fa cup', 'carabao cup', 'uefa champions league', 'fa community shield'],
  'dortmund': ['bundesliga', 'dfb-pokal', 'uefa champions league'],
  'barcelona': ['la liga', 'copa del rey', 'uefa champions league', 'supercopa de españa'],
  'gamba osaka': ['j1 league', 'emperors cup', 'j league cup']
};

export default function AddMatchPage() {
  const [status, setStatus] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('送信中...');

    const form = e.currentTarget;
    // form.team.value は selectedTeamId と同じ
    const teamId = form.team.value; 
    const competition = form.competition.value;
    const matchName = form.matchName.value;
    const matchDate = form.matchDate.value;
    const isOvertimeOrPK = form.isOvertimeOrPK.checked;
    const isFinal = form.isFinal.checked;

    // ✅ 追加: 選択されたチームの現在のシーズンを取得
    const selectedTeamConfig = TEAMS.find(t => t.id === teamId);
    const season = selectedTeamConfig ? selectedTeamConfig.currentSeason : '25/26';

    try {
      const response = await fetch('/api/add-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          team: teamId, 
          competition, 
          matchName, 
          matchDate, 
          isOvertimeOrPK, 
          isFinal,
          season // ✅ 追加: 正しいシーズンを送る
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`成功: ${data.message}`);
        form.reset();
        setSelectedTeamId('');
      } else {
        setStatus(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error('試合の追加中にエラー:', error);
      setStatus('試合の追加に失敗しました。');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="flex justify-between w-full max-w-xl mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          &lt; トップに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-gray-700">試合の追加</h1>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">チーム:</label>
            <select 
              id="team" 
              name="team" 
              required 
              className="w-full p-3 border border-gray-300 rounded-md" 
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value="">選択してください</option>
              {/* ✅ 修正: config.ts の TEAMS を使用 */}
              {TEAMS.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="competition" className="block text-sm font-medium text-gray-700 mb-2">大会:</label>
            <select 
              id="competition" 
              name="competition" 
              required 
              className="w-full p-3 border border-gray-300 rounded-md" 
              disabled={!selectedTeamId}
            >
              <option value="">選択してください</option>
              {selectedTeamId && teamCompetitions[selectedTeamId] && teamCompetitions[selectedTeamId].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700 mb-2">試合日:</label>
            <input type="date" id="matchDate" name="matchDate" className="w-full p-3 border border-gray-300 rounded-md" />
          </div>

          <div className="mb-6">
            <label htmlFor="matchName" className="block text-sm font-medium text-gray-700 mb-2">試合名:</label>
            <input type="text" id="matchName" name="matchName" required className="w-full p-3 border border-gray-300 rounded-md" />
          </div>

          <div className="mb-4">
            <label htmlFor="isOvertimeOrPK" className="flex items-center text-sm font-medium text-gray-700">
              <input type="checkbox" id="isOvertimeOrPK" name="isOvertimeOrPK" className="mr-2 h-4 w-4 text-blue-600 rounded" />
              延長またはPK戦でしたか？
            </label>
          </div>
          
          <div className="mb-6">
            <label htmlFor="isFinal" className="flex items-center text-sm font-medium text-gray-700">
              <input type="checkbox" id="isFinal" name="isFinal" className="mr-2 h-4 w-4 text-blue-600 rounded" />
              この試合は決勝戦ですか？
            </label>
          </div>

          <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300">
            試合を追加
          </button>
        </form>
        {status && <p className="mt-4 text-center text-sm font-bold">{status}</p>}
      </div>
    </div>
  );
}