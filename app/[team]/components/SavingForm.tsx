'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface TeamSavings {
  [competition: string]: { total: number };
}

interface SavingFormProps {
  teamName: string;
  setTeamSavings: React.Dispatch<React.SetStateAction<TeamSavings>>;
  teamSavings: TeamSavings;
  season: string;
}

// チームごとの大会リスト
const teamCompetitions: { [key: string]: string[] } = {
  'liverpool': ['premier league', 'fa cup', 'carabao cup', 'uefa champions league', 'fa community shield'],
  'dortmund': ['bundesliga', 'dfb-pokal', 'uefa champions league'],
  'barcelona': ['la liga', 'copa del rey', 'uefa champions league', 'supercopa de españa'],
  'gamba-osaka': ['j1 league', 'emperors cup', 'j league cup']
};

interface Match {
  id: number;
  team: string;
  competition: string;
  match_name: string;
  match_date: string | null;
  is_overtime_or_pk: number;
}

// チームごとの注目選手（スタメンボーナス用）
const mainPlayers: { [key: string]: string } = {
  'liverpool': 'Bradley',
  'dortmund': 'Brandt',
  'barcelona': 'Fermin',
  'gamba-osaka': 'Gin'
};

export default function SavingForm({ teamName, setTeamSavings, teamSavings, season }: SavingFormProps) {
  const searchParams = useSearchParams();
  const initialCompetition = (searchParams.get('competition') || '').toLowerCase().trim();
  const initialMatchName = (searchParams.get('matchName') || '').trim();
  const initialMatchDate = searchParams.get('matchDate') || '';

  const [selectedCompetition, setSelectedCompetition] = useState(initialCompetition);
  const [selectedMatchName, setSelectedMatchName] = useState(initialMatchName);
  const [selectedMatchDate, setSelectedMatchDate] = useState<string>(initialMatchDate);
  const [canHaveOvertime, setCanHaveOvertime] = useState(false);

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMatchNames, setSavedMatchNames] = useState<string[]>([]);

  // 1. 全試合データの取得
  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        const response = await fetch(`/api/get-matches?season=${season}`, { cache: 'no-store' });
        const data = await response.json();
        setAllMatches(data);
      } catch (error) {
        console.error('試合リストの取得に失敗しました:', error);
      }
    };
    fetchAllMatches();
  }, [season]);

  // 2. 記録済み試合データの取得
  useEffect(() => {
    const fetchSavedMatches = async () => {
      try {
        const response = await fetch(`/api/get-saved-matches?team=${teamName}&season=${season}`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setSavedMatchNames(data);
        }
      } catch (error) {
        console.error('保存済み試合の取得に失敗しました:', error);
      }
    };
    fetchSavedMatches();
  }, [teamName, season, teamSavings]);

  // 3. リストのフィルタリング処理
  useEffect(() => {
    if (selectedCompetition) {
      const filtered = allMatches.filter(match => {
        const isTeamMatch = match.team.toLowerCase() === teamName.toLowerCase();
        const isCompMatch = match.competition.toLowerCase() === selectedCompetition.toLowerCase();
        
        const isAlreadySaved = savedMatchNames.some(savedName => 
          savedName.toLowerCase().trim() === match.match_name.toLowerCase().trim()
        );

        return isTeamMatch && isCompMatch && !isAlreadySaved;
      });
      setFilteredMatches(filtered);
    } else {
      setFilteredMatches([]);
    }
  }, [selectedCompetition, teamName, allMatches, savedMatchNames]);

  // 4. 試合詳細情報の取得
  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!selectedMatchName || !selectedCompetition) {
        setCanHaveOvertime(false);
        if (!initialMatchDate) setSelectedMatchDate('');
        return;
      }
      try {
        const response = await fetch(`/api/get-match-details?team=${teamName}&competition=${selectedCompetition}&matchName=${selectedMatchName}&season=${season}`);
        const data: Match = await response.json();
        
        if (data.match_date) {
          const date = new Date(data.match_date);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          setSelectedMatchDate(`${yyyy}-${mm}-${dd}`);
        } else {
          if (!initialMatchDate) setSelectedMatchDate('');
        }

        setCanHaveOvertime(data.is_overtime_or_pk === 1);

      } catch (error) {
        // エラー処理
      }
    };
    fetchMatchDetails();
  }, [selectedMatchName, teamName, selectedCompetition, season, initialMatchDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const team = form.team.value;
    const competition = form.competition.value;
    const matchName = form.matchName.value;
    const matchResult = form.matchResult.value;
    const isOvertimeOrPK = form.isOvertimeOrPKCheckbox?.checked || false;
    const isStarter = form.isStarter.checked;
    const isFukudaCommentator = form.isFukudaCommentator.checked;
    const goals = parseInt(form.goals.value, 10);
    const assists = parseInt(form.assists.value, 10);
    
    // ★ 修正: 2つのチェックボックスを個別に取得
    const isMvp = form.isMvp.checked;
    const isOnSite = form.isOnSite.checked;

    const matchDate = form.matchDate.value;

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          season,
          team,
          competition,
          matchName,
          matchDate,
          matchResult,
          isOvertimeOrPK,
          isStarter,
          isFukudaCommentator,
          goals,
          assists,
          isMvp,    // MVP
          isOnSite, // 現地観戦（追加）
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const addedAmount = data.addedAmount;
        const previousTotal = teamSavings[competition]?.total || 0;

        setTeamSavings(prev => {
          const newTeamState = { ...prev };
          newTeamState[competition] = { total: previousTotal + addedAmount };
          return newTeamState;
        });

        setSavedMatchNames(prev => [...prev, matchName]);

        alert(`今回の貯金額は ${addedAmount}円 です！`);
        form.reset();
        
        setSelectedMatchDate('');
        setSelectedMatchName('');
        setCanHaveOvertime(false);
      } else {
        alert(`エラーが発生しました: ${data.message}`);
      }
    } catch (error) {
      console.error('APIリクエスト中にエラーが発生しました:', error);
      alert('通信エラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">試合結果の入力</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">チーム:</label>
          <input type="text" id="team" name="team" value={teamName} readOnly className="w-full p-3 border border-gray-300 rounded-md bg-gray-200" />
        </div>
        <div className="mb-6">
          <label htmlFor="competition" className="block text-sm font-medium text-gray-700 mb-2">大会:</label>
          <select id="competition" name="competition" required 
                  className="w-full p-3 border border-gray-300 rounded-md" 
                  value={selectedCompetition}
                  onChange={(e) => {
                    setSelectedCompetition(e.target.value);
                    setSelectedMatchName('');
                  }}>
            <option value="">選択してください</option>
            {teamCompetitions[teamName]?.map((comp) => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="matchName" className="block text-sm font-medium text-gray-700 mb-2">試合名:</label>
          <select id="matchName" name="matchName" required className="w-full p-3 border border-gray-300 rounded-md"
                  onChange={(e) => setSelectedMatchName(e.target.value)} value={selectedMatchName}>
            <option value="">選択してください</option>
            {filteredMatches.map((match) => (
              <option key={match.id} value={match.match_name}>{match.match_name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700 mb-2">試合日:</label>
          <input
            type="date"
            id="matchDate"
            name="matchDate"
            value={selectedMatchDate}
            onChange={(e) => setSelectedMatchDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="matchResult" className="block text-sm font-medium text-gray-700 mb-2">試合結果:</label>
          <select id="matchResult" name="matchResult" required className="w-full p-3 border border-gray-300 rounded-md">
            <option value="">選択してください</option>
            <option value="win">勝利</option>
            <option value="draw">引き分け</option>
            <option value="lose">負け</option>
          </select>
        </div>
        
        {canHaveOvertime && (
          <div className="mb-6">
            <label htmlFor="isOvertimeOrPKCheckbox" className="flex items-center text-sm font-medium text-gray-700">
              <input 
                type="checkbox" 
                id="isOvertimeOrPKCheckbox" 
                name="isOvertimeOrPKCheckbox" 
                className="mr-2 h-4 w-4 text-blue-600 rounded" 
              />
              この試合は延長またはPK戦でしたか？
            </label>
            <p className="text-xs text-gray-500 ml-6">※90分で決着がついた場合はチェックしないでください</p>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4">個人スタッツ</h3>
        <div className="mb-4">
          <label htmlFor="isStarter" className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" id="isStarter" name="isStarter" className="mr-2 h-4 w-4 text-blue-600 rounded" />
            {mainPlayers[teamName] || '選手'}がスタメン
          </label>
        </div>
        <div className="mb-4">
          <label htmlFor="isFukudaCommentator" className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" id="isFukudaCommentator" name="isFukudaCommentator" className="mr-2 h-4 w-4 text-blue-600 rounded" />
            解説福田
          </label>
        </div>
        <div className="mb-4">
          <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">ゴール:</label>
          <input type="number" id="goals" name="goals" min="0" defaultValue="0" className="w-full p-3 border border-gray-300 rounded-md" />
        </div>
        <div className="mb-4">
          <label htmlFor="assists" className="block text-sm font-medium text-gray-700 mb-2">アシスト:</label>
          <input type="number" id="assists" name="assists" min="0" defaultValue="0" className="w-full p-3 border border-gray-300 rounded-md" />
        </div>

        {/* ★ 修正: MVPと現地観戦を分割 */}
        <div className="mb-4">
          <label htmlFor="isMvp" className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" id="isMvp" name="isMvp" className="mr-2 h-4 w-4 text-blue-600 rounded" />
            MVP獲得
          </label>
        </div>
        <div className="mb-6">
          <label htmlFor="isOnSite" className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" id="isOnSite" name="isOnSite" className="mr-2 h-4 w-4 text-blue-600 rounded" />
            現地観戦
          </label>
        </div>
        <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300" disabled={isSubmitting}>
          {isSubmitting ? '記録中...' : '貯金を計算'}
        </button>
      </form>
    </div>
  );
}