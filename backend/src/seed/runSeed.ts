/**
 * runSeed.ts — Master seed runner. Safe to run multiple times (upserts only).
 * Usage: npm run seed
 */
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db';
import { seedTasks } from './tasks.seed';
import { seedBadges } from './badges.seed';
import { seedRewards } from './rewards.seed';
import { seedLessons } from './lessons.seed';

async function run() {
  console.log('🌱 Starting GRIDSHIELD AI seed...');
  await connectDB();

  await seedTasks();
  await seedBadges();
  await seedRewards();
  await seedLessons();

  console.log('✅ Seed complete.');
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
