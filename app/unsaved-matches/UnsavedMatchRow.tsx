'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MatchProps {
  id: number;
  match_date: string | null; // シリアライズのため文字列で受け取る
  team: string;
  competition: string;
  match_name: string;
  season: string;
}

export default function UnsavedMatchRow({ match }: { match: MatchProps }) {
  // 初期値: "YYYY-MM-DD" 形式に変換（nullの場合は空文字）
  const initialDate = match.match_date 
    ? new Date(match.match_date).toISOString().split('T')[0] 
    : '';
    
  const [date, setDate] = useState(initialDate);
  const [isSaving, setIsSaving] = useState(false);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    setIsSaving(true);

    try {
      const res = await fetch('/api/update-match-date', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: match.id, 
          matchDate: newDate 
        }),
      });
      
      if (!res.ok) {
        console.error('日付の更新に失敗しました');
        // 必要に応じてエラー表示やロールバック処理
      }
    } catch (error) {
      console.error('通信エラー:', error);
    } finally {
      // 少し遅延させて保存完了を視覚的に伝える（任意）
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
      <td className="p-4 whitespace-nowrap">
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className={`p-2 border rounded text-sm outline-none transition-colors ${
              isSaving ? 'bg-green-50 border-green-400' : 'bg-white border-gray-300 focus:border-blue-400'
            }`}
          />
          {isSaving && (
            <span className="absolute right-[-20px] top-2 text-green-500 text-xs animate-pulse">
              💾
            </span>
          )}
        </div>
      </td>
      <td className="p-4 whitespace-nowrap font-bold capitalize">
        {match.team === 'gamba osaka' ? 'Gamba Osaka' : match.team}
      </td>
      <td className="p-4 whitespace-nowrap capitalize">
        {match.competition}
      </td>
      <td className="p-4 font-medium text-gray-800">
        {match.match_name}
      </td>
      <td className="p-4 whitespace-nowrap text-center">
        <Link
          // 入力ページへ遷移（seasonも渡す）
          href={`/${match.team}?season=${match.season}`}
          className="text-blue-600 hover:underline font-bold text-xs bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
        >
          入力へ →
        </Link>
      </td>
    </tr>
  );
}