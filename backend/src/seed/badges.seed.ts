/** badges.seed.ts — Idempotent upsert of all 8 badge definitions. */
import { Badge } from '../models/Badge';

export async function seedBadges() {
  const badges = [
    { badgeId: 'badge-first-action', title: 'First Step', subtitle: 'Begin your green journey', icon: '🌱', category: 'Milestone', requirementDescription: 'Complete your first eco-habit in GRIDSHIELD AI.', targetProgress: 1, bonusPoints: 20, criterionType: 'tasks_completed_ever', criterionThreshold: 1 },
    { badgeId: 'badge-streak-3', title: '3-Day Momentum', subtitle: 'Forming positive habits', icon: '🌿', category: 'Consistency', requirementDescription: 'Maintain a 3-day active daily streak.', targetProgress: 3, bonusPoints: 30, criterionType: 'streak_days', criterionThreshold: 3 },
    { badgeId: 'badge-streak-7', title: 'Week of Green', subtitle: '7 days of planet care', icon: '🔥', category: 'Consistency', requirementDescription: 'Maintain a 7-day active daily streak.', targetProgress: 7, bonusPoints: 50, criterionType: 'streak_days', criterionThreshold: 7 },
    { badgeId: 'badge-carbon-cutter', title: 'Carbon Cutter', subtitle: 'Avert 10kg of CO₂e', icon: '🍃', category: 'Impact', requirementDescription: 'Log tasks that avert at least 10 kg of carbon emissions.', targetProgress: 10, bonusPoints: 40, criterionType: 'co2_kg', criterionThreshold: 10 },
    { badgeId: 'badge-tree-planter', title: 'Earth Sower', subtitle: 'Plant your first tree', icon: '🌳', category: 'Restoration', requirementDescription: 'Redeem your points to sponsor a certified tree planting.', targetProgress: 1, bonusPoints: 50, criterionType: 'trees_planted', criterionThreshold: 1 },
    { badgeId: 'badge-quiz-scholar', title: 'Eco Scholar', subtitle: 'Master 3 lessons', icon: '🎓', category: 'Knowledge', requirementDescription: 'Complete and score over 60% on 3 interactive eco quizzes.', targetProgress: 3, bonusPoints: 35, criterionType: 'lessons_completed', criterionThreshold: 3 },
    { badgeId: 'badge-grid-hero', title: 'Grid Stabilizer', subtitle: 'Save 15 kWh total', icon: '⚡', category: 'Energy', requirementDescription: 'Conserve a cumulative total of 15 kWh electricity.', targetProgress: 15, bonusPoints: 45, criterionType: 'energy_kwh', criterionThreshold: 15 },
    { badgeId: 'badge-water-guardian', title: 'Water Guardian', subtitle: 'Save 150 Liters', icon: '💧', category: 'Water', requirementDescription: 'Save 150 liters of clean fresh water through mindful habits.', targetProgress: 150, bonusPoints: 40, criterionType: 'water_liters', criterionThreshold: 150 },
  ];

  let upserted = 0;
  for (const badge of badges) {
    await Badge.findOneAndUpdate(
      { badgeId: badge.badgeId },
      { $setOnInsert: badge },
      { upsert: true, new: true }
    );
    upserted++;
  }
  console.log(`  ✓ Badges: ${upserted} upserted`);
}
