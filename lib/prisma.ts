import { PrismaClient } from '@prisma/client';

// 開発環境でホットリロード時にPrismaClientのインスタンスが再作成されるのを防ぐためのグローバル変数
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 必要に応じてログ設定を追加（本番環境では不要）
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;