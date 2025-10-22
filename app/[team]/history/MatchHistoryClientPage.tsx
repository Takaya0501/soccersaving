'use client';

import Link from 'next/link';
import { useState } from 'react';
// Prismaの型をインポート
import type { Savings } from '@prisma/client';

// Savingsモデルの配列を型として使用
interface MatchHistoryProps {
  // Savings[] を使用してanyを排除
  history: Savings[];
  teamName: string;
}

export default function MatchHistoryClientPage({ history: initialHistory, teamName }: MatchHistoryProps) {
  // Stateにも Savings[] を適用
  const [history, setHistory] = useState<Savings[]>(initialHistory);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (id: number) => {
    // alert/confirmはカスタムUIに置き換える必要がありますが、ここでは一時的にconsole.logを使用します
    if (!window.confirm('本当にこの試合データを削除しますか？')) {
      console.log("Deletion cancelled.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/edit-savings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      } else {
        console.error('データの削除に失敗しました。');
      }
    } catch (error) {
      console.error('削除中にエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="w-full max-w-2xl mb-4">
        <Link href={`/${teamName}`} className="text-blue-500 hover:underline">
          &lt; 戻る
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-gray-700">{teamName} 試合履歴</h1>
      {isLoading ? (
        <p>削除中...</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          {history.length === 0 ? (
            <p className="text-center text-gray-500">試合データがありません。</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md shadow-sm">
                  <div>
                    {/* match_nameはsnake_caseに修正済み */}
                    <p className="font-semibold text-gray-800">{item.match_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.competition} - {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-bold text-green-600">{item.amount}円</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      disabled={isLoading}
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
