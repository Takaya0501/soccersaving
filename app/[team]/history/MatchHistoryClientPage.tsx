// app/[team]/history/MatchHistoryClientPage.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
// PrismaClientの型定義を使用 (ここではPrisma.Savingの型が正確です)
// ただし、Prismaの型を直接インポートするとビルドに失敗することがあるため、ここでは安全な型を定義します。
import type { Savings } from '@prisma/client';

interface MatchHistoryProps {
  // ✅ Prismaの型を使用 (Savingsを複数形に修正)
  history: Savings[];
  teamName: string;
}

export default function MatchHistoryClientPage({ history: initialHistory, teamName }: MatchHistoryProps) {
  // useStateにも型を適用
  const [history, setHistory] = useState<Savings[]>(initialHistory);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (id: number) => {
    // ❌ window.confirm() は Next.js のサーバー環境（Vercel）で警告が出るため、カスタムモーダルが必要です。
    // 今回はデプロイを優先し、暫定的に確認メッセージを console.log に置き換えます。
    if (!confirm('本当にこの試合データを削除しますか？')) {
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
        console.error('データの削除に失敗しました:', await response.json());
        alert('データの削除に失敗しました。');
      }
    } catch (error) {
      alert('サーバーエラーが発生しました。');
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
                // item.timestamp は DateTime型なので、toLocaleStringに修正
                <li key={item.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{item.match_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.competition} - {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-bold text-green-600">{item.amount}円</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="削除"
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

// 簡易的な confirm 関数をグローバルに定義 (クライアントサイドでのみ利用可能)
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.confirm = (message) => global.confirm(message);
}
