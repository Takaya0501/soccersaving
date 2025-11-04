'use client';

import { useState } from 'react';
// ⬇️ 修正: インポート先を './page' から './types' に変更
import type { MatchSavingWithDetails as MatchSaving } from './types';

// 編集フォームが受け取る match プロパティの型
// 独自の MatchSaving 型を削除し、インポートした型（リネーム済み）を使用
/*
interface MatchSaving {
  id: number;
  team: string;
  competition: string;
  match_name: string;
  amount: number;
  timestamp: string;
  // Prismaの型定義に合わせて、snake_caseのプロパティを維持
  is_final: boolean | number; 
  is_overtime_or_pk: boolean | number;
}
*/

interface EditFormProps {
  match: MatchSaving; // ⬅️ 修正: リネームした型を使用
  onCancel: () => void;
  onUpdate: (id: number, amount: number, matchDate: string | null) => void;
}

const mainPlayers: { [key: string]: string } = {
  'liverpool': 'Bradley',
  'dortmund': 'Brandt',
  'barcelona': 'Fermin'
};

export default function EditSavingForm({ match, onCancel, onUpdate }: EditFormProps) {
  // ✅ matchResult stateを保持し、計算ロジックで使用する
  const [matchResult, setMatchResult] = useState('');
  // ⬅️ 修正: match.match_date (Date | null) から初期値を設定
  const [matchDate, setMatchDate] = useState<string>(match.match_date ? new Date(match.match_date).toISOString().split('T')[0] : '');
  const [isOvertimeOrPK, setIsOvertimeOrPK] = useState(!!match.is_overtime_or_pk); 
  const [isStarter, setIsStarter] = useState(false);
  const [isFukudaCommentator, setIsFukudaCommentator] = useState(false); // ✅ Stateを保持し、計算ロジックで使用する
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [isMvp, setIsMvp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // ✅ State変数を直接計算ロジックの入力として使用する
    // ⬅️ 修正: matchDate (string) から Date オブジェクトまたは null を作成
    const currentMatchDate = matchDate ? new Date(matchDate).toISOString() : null;
    const currentMatchResult = matchResult;
    const currentIsOvertimeOrPK = isOvertimeOrPK;
    const currentIsStarter = isStarter;
    const currentIsFukudaCommentator = isFukudaCommentator;
    const currentGoals = goals;
    const currentAssists = assists;
    const currentIsMvp = isMvp;

    let recalculatedAmount = 0;
    
    if (currentMatchResult === 'win') recalculatedAmount += 500;
    else if (currentMatchResult === 'draw') recalculatedAmount += 200;
    else if (currentMatchResult === 'lose') recalculatedAmount += 100;
    
    if (currentIsOvertimeOrPK) recalculatedAmount += 200;
    
    if (currentIsStarter) recalculatedAmount += 200;
    if (currentIsFukudaCommentator) recalculatedAmount += 500;
    recalculatedAmount += currentGoals * 500;
    recalculatedAmount += currentAssists * 300;
    if (currentIsMvp) recalculatedAmount += 500;

    if (match.is_final) { 
      if (currentMatchResult === 'win') {
        if (match.competition.includes('champions league') || match.competition.includes('europa league')) {
          recalculatedAmount += 10000;
        } else {
          recalculatedAmount += 5000;
        }
      } else if (currentMatchResult === 'lose') {
        if (match.competition.includes('champions league') || match.competition.includes('europa league')) {
          recalculatedAmount += 7000;
        } else {
          recalculatedAmount += 3000;
        }
      }
    }
    
    onUpdate(match.id, recalculatedAmount, currentMatchDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">記録を編集</h2>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">チーム: <span className="font-bold">{match.team}</span></p>
            <p className="text-sm font-medium text-gray-700">大会: <span className="font-bold">{match.competition}</span></p>
            <p className="text-sm font-medium text-gray-700 mb-2">試合名: <span className="font-bold">{match.match_name}</span></p>
             {/* 試合日の入力欄 */}
            <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700 mb-1">試合日:</label>
            <input type="date" id="matchDate" name="matchDate" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />

          </div>
          <hr className="my-4" />

          <div className="mb-4">
            <label htmlFor="matchResult" className="block text-sm font-medium text-gray-700 mb-2">試合結果:</label>
            {/* ✅ value={matchResult} を追加してStateを使用 */}
            <select id="matchResult" name="matchResult" required className="w-full p-3 border border-gray-300 rounded-md" onChange={(e) => setMatchResult(e.target.value)} value={matchResult}>
              <option value="">選択してください</option>
              <option value="win">勝利</option>
              <option value="draw">引き分け</option>
              <option value="lose">負け</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="isOvertimeOrPK" className="flex items-center text-sm font-medium text-gray-700">
              <input type="checkbox" id="isOvertimeOrPK" className="mr-2" checked={isOvertimeOrPK} onChange={(e) => setIsOvertimeOrPK(e.target.checked)} />
              延長またはPK戦でしたか？
            </label>
          </div>
          
          <h3 className="text-xl font-semibold my-4">個人スタッツ</h3>
          <div className="mb-4">
            <label htmlFor="isStarter" className="flex items-center text-sm font-medium text-gray-700">
              <input type="checkbox" id="isStarter" className="mr-2" checked={isStarter} onChange={(e) => setIsStarter(e.target.checked)} />
              {mainPlayers[match.team] || '選手'}がスタメン
            </label>
          </div>
          <div className="mb-4">
            <label htmlFor="isFukudaCommentator" className="flex items-center text-sm font-medium text-gray-700">
              <input type="checkbox" id="isFukudaCommentator" className="mr-2" checked={isFukudaCommentator} onChange={(e) => setIsFukudaCommentator(e.target.checked)} />
              解説福田
            </label>
          </div>
          <div className="mb-4">
            <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">ゴール:</label>
            <input type="number" id="goals" name="goals" className="w-full p-3 border rounded-md" value={goals} onChange={(e) => setGoals(Number(e.target.value))} />
          </div>
          <div className="mb-4">
            <label htmlFor="assists" className="block text-sm font-medium text-gray-700 mb-2">アシスト:</label>
            <input type="number" id="assists" name="assists" className="w-full p-3 border rounded-md" value={assists} onChange={(e) => setAssists(Number(e.target.value))} />
          </div>
          <div className="mb-4">
            <label htmlFor="isMvp" className="flex items-center text-sm font-medium text-gray-700">
              <input type="checkbox" id="isMvp" className="mr-2" checked={isMvp} onChange={(e) => setIsMvp(e.target.checked)} />
              MVP獲得
            </label>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded-md" disabled={isSubmitting}>キャンセル</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md" disabled={isSubmitting}>更新</button>
          </div>
        </form>
      </div>
    </div>
  );
}

