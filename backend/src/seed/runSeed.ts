/**
 * runSeed.ts — Master seed runner. Safe to run multiple times (upserts only).
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Deterministically load backend/.env
const backendDir = path.resolve(__dirname, '../..');
const envPath = path.resolve(backendDir, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

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
