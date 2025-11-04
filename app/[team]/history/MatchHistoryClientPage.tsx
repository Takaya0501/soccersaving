'use client';

import Link from 'next/link';
import { useState } from 'react';
// ⬇️ 修正: インポート先を './page' から './types' に変更
import type { MatchSavingWithDetails } from './types';
// 編集フォームをインポート
import EditSavingForm from './EditSavingForm';

// MatchSavingWithDetails を使用
interface MatchHistoryProps {
  history: MatchSavingWithDetails[];
  teamName: string;
}

export default function MatchHistoryClientPage({ history: initialHistory, teamName }: MatchHistoryProps) {
  // Stateにも MatchSavingWithDetails[] を適用
  const [history, setHistory] = useState<MatchSavingWithDetails[]>(initialHistory);
  const [isLoading, setIsLoading] = useState(false);
  // 編集対象の試合を管理
  const [selectedMatch, setSelectedMatch] = useState<MatchSavingWithDetails | null>(null);

  const handleDelete = async (id: number) => {
    // 編集モーダルが開いている時は削除しない
    if (selectedMatch) return;

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

  // 更新処理
  const handleUpdate = async (id: number, amount: number, matchDate: string | null) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/edit-savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, amount, matchDate }), // 試合日(string | null)も送信
      });

      if (response.ok) {
        // 履歴のStateを更新
        setHistory(history.map(item =>
          item.id === id 
            ? { 
                ...item, 
                amount: amount, 
                // ⬅️ 修正: string | null を Date | null に変換
                match_date: matchDate ? new Date(matchDate) : null 
              } 
            : item
        ));
        setSelectedMatch(null); // モーダルを閉じる
      } else {
        console.error('データの更新に失敗しました。');
        alert('データの更新に失敗しました。');
      }
    } catch (error) {
      console.error('更新中にエラー:', error);
      alert('更新中にエラーが発生しました。');
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
        <p>処理中...</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          {history.length === 0 ? (
            <p className="text-center text-gray-500">試合データがありません。</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{item.match_name}</p>
                    <p className="text-sm text-gray-600">
                      {/* item.match_date は Date | null なので安全 */}
                      {item.match_date ? `${new Date(item.match_date).toLocaleDateString()} - ` : ''}
                      {item.competition} - {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-bold text-green-600">{item.amount}円</p>
                    {/* 編集ボタンを追加 */}
                    <button
                      onClick={() => setSelectedMatch(item)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      disabled={isLoading}
                    >
                      編集
                    </button>
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

      {/* 編集フォーム（モーダル） */}
      {selectedMatch && (
        <EditSavingForm
          match={selectedMatch}
          onCancel={() => setSelectedMatch(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

