'use client';

import { useState } from 'react';

interface MatchSaving {
  id: number;
  team: string;
  competition: string;
  match_name: string;
  amount: number;
  timestamp: string;
  // Prismaの型定義に合わせて、snake_caseでアクセスするように変更 (既存のコードに合わせていますが、実際はサーバーから渡されるデータ構造に依存します)
  is_final: boolean | number; 
  is_overtime_or_pk: boolean | number;
}

interface EditFormProps {
  match: MatchSaving;
  onCancel: () => void;
  onUpdate: (id: number, amount: number) => void;
}

const mainPlayers: { [key: string]: string } = {
  'liverpool': 'Bradley',
  'dortmund': 'Brandt',
  'barcelona': 'Fermin'
};

export default function EditSavingForm({ match, onCancel, onUpdate }: EditFormProps) {
  // const [matchResult, setMatchResult] = useState(''); // 削除: 未使用
  const [matchResult, setMatchResult] = useState('');
  // ✅ is_overtime_or_pk は number | boolean の可能性があるため、! で強制的に boolean に変換し、stateに合わせる
  const [isOvertimeOrPK, setIsOvertimeOrPK] = useState(!!match.is_overtime_or_pk); 
  const [isStarter, setIsStarter] = useState(false);
  // const [isFukudaCommentator, setIsFukudaCommentator] = useState(false); // 削除: 未使用
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [isMvp, setIsMvp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFukudaCommentator, setIsFukudaCommentator] = useState(false); // 必須のため再定義

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    // const matchResult = form.matchResult.value; // setMatchResultが使用済みのため、stateを使う
    const currentMatchResult = form.matchResult.value;
    const isStarter = form.isStarter.checked;
    const isFukudaCommentator = form.isFukudaCommentator.checked;
    const goals = parseInt(form.goals.value, 10);
    const assists = parseInt(form.assists.value, 10);
    const isMvp = form.isMvp.checked;

    let recalculatedAmount = 0;
    
    if (currentMatchResult === 'win') recalculatedAmount += 500;
    else if (currentMatchResult === 'draw') recalculatedAmount += 200;
    else if (currentMatchResult === 'lose') recalculatedAmount += 100;
    
    if (isOvertimeOrPK) recalculatedAmount += 200;
    
    if (isStarter) recalculatedAmount += 200;
    if (isFukudaCommentator) recalculatedAmount += 500;
    recalculatedAmount += goals * 500;
    recalculatedAmount += assists * 300;
    if (isMvp) recalculatedAmount += 500;

    // ✅ match.is_final をチェック（DBから取得した値は0/1またはtrue/falseの可能性あり）
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
    
    onUpdate(match.id, recalculatedAmount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">記録を編集</h2>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">チーム: <span className="font-bold">{match.team}</span></p>
            <p className="text-sm font-medium text-gray-700">大会: <span className="font-bold">{match.competition}</span></p>
            <p className="text-sm font-medium text-gray-700">試合名: <span className="font-bold">{match.match_name}</span></p>
          </div>
          <hr className="my-4" />

          <div className="mb-4">
            <label htmlFor="matchResult" className="block text-sm font-medium text-gray-700 mb-2">試合結果:</label>
            <select id="matchResult" name="matchResult" required className="w-full p-3 border border-gray-300 rounded-md" onChange={(e) => setMatchResult(e.target.value)}>
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
          <div className="mb-4">
            {/* 未使用の変数に関連するチェックボックスを復活 */}
            <label htmlFor="isFukudaCommentator" className="flex items-center text-sm font-medium text-gray-700">
              <input type="checkbox" id="isFukudaCommentator" name="isFukudaCommentator" className="mr-2 h-4 w-4 text-blue-600 rounded" checked={isFukudaCommentator} onChange={(e) => setIsFukudaCommentator(e.target.checked)} />
              解説福田
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
