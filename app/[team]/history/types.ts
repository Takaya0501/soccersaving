// app/[team]/history/types.ts
import type { Savings, Matches } from '@prisma/client';

// 共有する型をここに定義
export type MatchSavingWithDetails = Savings & Pick<Matches, 'is_final' | 'is_overtime_or_pk'>;