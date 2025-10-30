// Vercel
import prisma from '@/lib/prisma';
import TeamClientPage from './TeamClientPage';

interface TeamSavings {
  // インデックスシグネチャ
  [competition: string]: { total: number }; 
}

// ✅ 戻り値の型を明示的に指定 (Promise<TeamSavings>)
async function getTeamSavings(teamName: string): Promise<TeamSavings> {
  try {
    const allSavings = await prisma.savings.groupBy({
      by: ['competition'],
      _sum: { amount: true },
      where: { team: teamName },
    });

    // ✅ 変数 'result' に型 (TeamSavings) を明示的に指定
    const result: TeamSavings = {}; 
    
    allSavings.forEach(row => {
      // competitionがnullになることはPrismaのgroupByのby: ['competition']の指定により通常ありえませんが、
      // 念の為のチェックとして残しておくのは安全です。
      if (row.competition) {
        // row._sum.amountは number | null なので、|| 0 ではなく ?? 0 がより正確
        result[row.competition] = { total: row._sum.amount ?? 0 };
      }
    });
    return result;
  } catch (error) {
    console.error('チームの貯金額取得に失敗しました:', error);
    return {};
  }
}

// ⬇️ 修正: { params } を { params: p } に変更
export default async function TeamPage({ params: p }: { params: { team: string } }) {
  const teamName = p.team; // ⬅️ 修正: params.team を p.team に変更
  // getTeamSavingsの戻り値の型が確定したため、この変数も安全になります
  const teamSavings = await getTeamSavings(teamName);

  return <TeamClientPage teamName={teamName} teamSavings={teamSavings as TeamSavings} />;
}

