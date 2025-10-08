import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const {
      team,
      competition,
      matchName,
      matchResult,
      isOvertimeOrPK,
      isStarter,
      isFukudaCommentator,
      goals,
      assists,
      isMvp,
    } = await request.json();

    const db = await openDb();

    const existingMatch = await db.get(
      'SELECT id FROM savings WHERE team = ? AND competition = ? AND match_name = ?',
      team,
      competition,
      matchName
    );

    if (existingMatch) {
      await db.close();
      return NextResponse.json({ message: 'この試合の記録は既に存在します。' }, { status: 409 });
    }
    
    const matchDetails = await db.get(
      'SELECT is_final FROM matches WHERE team = ? AND competition = ? AND match_name = ?',
      team,
      competition,
      matchName
    );

    let savingsAmount = 0;
    
    switch (matchResult) {
      case 'win':
        savingsAmount += 500;
        break;
      case 'draw':
        savingsAmount += 200;
        break;
      case 'lose':
        savingsAmount += 100;
        break;
      default:
        break;
    }

    if (isOvertimeOrPK) {
      savingsAmount += 200;
    }

    if (isStarter) {
      savingsAmount += 200;
    }
    if (isFukudaCommentator) {
      savingsAmount += 500;
    }
    savingsAmount += goals * 500;
    savingsAmount += assists * 300;
    if (isMvp) {
      savingsAmount += 500;
    }

    if (matchDetails && matchDetails.is_final) {
      if (matchResult === 'win') {
        if (competition.includes('champions league') || competition.includes('europa league')) {
          savingsAmount += 10000;
        } else {
          savingsAmount += 5000;
        }
      } else if (matchResult === 'lose') {
        if (competition.includes('champions league') || competition.includes('europa league')) {
          savingsAmount += 7000;
        } else {
          savingsAmount += 3000;
        }
      }
    }

    await db.run(
      'INSERT INTO savings (team, competition, match_name, amount, timestamp) VALUES (?, ?, ?, ?, ?)',
      team,
      competition,
      matchName,
      savingsAmount,
      new Date().toISOString()
    );

    const totalSavingsResult = await db.get('SELECT SUM(amount) AS total FROM savings WHERE team = ? AND competition = ?', team, competition);
    const currentSavings = totalSavingsResult.total || 0;

    await db.close();

    return NextResponse.json({
      message: '貯金が計算されました。',
      addedAmount: savingsAmount,
      currentSavings: currentSavings,
    });
  } catch (error) {
    console.error('貯金計算中にエラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}