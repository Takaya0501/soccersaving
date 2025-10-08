// app/[team]/history/MatchHistoryClientPage.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import EditSavingForm from './EditSavingForm'; // ✅ パスを修正

interface MatchSaving {
  id: number;
  team: string;
  competition: string;
  match_name: string;
  amount: number;
  timestamp: string;
}

export default function MatchHistoryClientPage({ matches, teamName }: { matches: MatchSaving[], teamName: string }) {
  const [editingMatch, setEditingMatch] = useState<MatchSaving | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm('本当にこの試合を削除しますか？')) {
      try {
        await fetch('/api/edit-savings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        window.location.reload();
      } catch (error) {
        console.error('削除に失敗しました:', error);
      }
    }
  };

  const handleUpdate = async (id: number, amount: number) => {
    try {
      await fetch('/api/edit-savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount }),
      });
      setEditingMatch(null);
      window.location.reload();
    } catch (error) {
      console.error('更新に失敗しました:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <Link href={`/${teamName}`} className="text-blue-500 hover:underline mb-4">
        &lt; 戻る
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-gray-700">{teamName} 試合履歴</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6">試合ごとの貯金額</h2>
        {matches.length === 0 ? (
          <p className="text-center text-gray-500">まだ試合の記録がありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {matches.map((match) => (
              <li key={match.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{match.match_name}</p>
                    <p className="text-sm text-gray-600">{match.competition}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingMatch && editingMatch.id === match.id ? (
                      <EditSavingForm match={editingMatch} onCancel={() => setEditingMatch(null)} onUpdate={handleUpdate} />
                    ) : (
                      <>
                        <p className="font-bold text-lg">{match.amount}円</p>
                        <button onClick={() => setEditingMatch(match)} className="bg-blue-500 text-white px-3 py-1 rounded">編集</button>
                        <button onClick={() => handleDelete(match.id)} className="bg-red-500 text-white px-3 py-1 rounded">削除</button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}