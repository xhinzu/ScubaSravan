import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { APP_CONFIG } from '@/config/appConfig';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabasePath() {
  const isVercel = process.env.VERCEL === '1';
  if (!isVercel) {
    return path.join(process.cwd(), 'prisma', 'dev.db');
  }

  const tmpPath = path.join('/tmp', 'dev.db');
  const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (!fs.existsSync(tmpPath)) {
    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, tmpPath);
      }
    } catch (e) {
      console.error('Failed to copy pre-seeded database to /tmp:', e);
    }
  }
  return tmpPath;
}

function createPrismaClient() {
  const dbPath = getDatabasePath();
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Auto-seeds default items if database table is empty.
 */
export async function ensureDefaultItems() {
  try {
    const count = await prisma.item.count();
    if (count === 0) {
      console.log('Seeding initial items...');
      for (const item of APP_CONFIG.defaultItems) {
        await prisma.item.create({
          data: {
            name: item.name,
            price: item.price,
            sortOrder: item.sortOrder,
            active: true,
          },
        });
      }
      console.log('Initial items seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding default items:', error);
  }
}
