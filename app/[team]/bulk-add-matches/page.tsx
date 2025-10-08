'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BulkAddMatchesPage() {
  const [status, setStatus] = useState('');
  const [jsonText, setJsonText] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('送信中...');
    
    try {
      const matches = JSON.parse(jsonText);
      const response = await fetch('/api/bulk-add-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches }), // ✅ この形式でAPIに送信
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`成功: ${data.addedCount}件の試合が追加されました。${data.skippedCount}件はスキップされました。`);
      } else {
        setStatus(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error('JSONパースまたはAPIリクエスト中にエラー:', error);
      setStatus('JSON形式が正しくありません。');
    }
  };

  const sampleJson = `[
  {
    "team": "liverpool",
    "competition": "premier league",
    "match_name": "M39: [A]NewMatch",
    "is_final": false,
    "is_overtime_or_pk": false
  }
]`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <div className="flex justify-between w-full max-w-xl mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          &lt; トップに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-gray-700">試合の一括追加</h1>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700 mb-2">
              JSONデータ
            </label>
            <textarea
              id="jsonInput"
              rows={10}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder={`例:\n[ { "team": "liverpool", "competition": "premier league", "match_name": "M39: [A]NewMatch" } ]`}
            ></textarea>
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition duration-300">
            まとめて追加
          </button>
        </form>
        {status && <p className="mt-4 text-center text-sm font-bold">{status}</p>}
        
        <div className="mt-6 text-sm text-gray-500">
          <h3 className="font-semibold mb-2">使い方:</h3>
          <p className="mb-1">以下の形式でJSONデータを入力し、ボタンを押してください。チーム名と大会名は小文字にしてください。</p>
          <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
            {sampleJson}
          </pre>
        </div>
      </div>
    </div>
  );
}