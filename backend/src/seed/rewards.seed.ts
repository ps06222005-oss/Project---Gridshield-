/** rewards.seed.ts — Idempotent upsert of all 5 rewards. */
import { Reward } from '../models/Reward';

export async function seedRewards() {
  const rewards = [
    { rewardId: 'rew-tree-1', title: 'Plant a Mangrove in Sundarbans', organization: 'Grow-Trees India Foundation', costPoints: 200, category: 'Tree Planting', description: 'Each mangrove tree absorbs up to 12.3 kg of CO₂ per year, stabilizes vulnerable estuarine shorelines, and safeguards endangered Bengal tiger habitats.', impactMetric: '1 Mangrove sapling planted • Verified certificate', imageEmoji: '🌱' },
    { rewardId: 'rew-solar-1', title: 'Solar Study Lantern for Rural Classrooms', organization: 'Barefoot College Solar Mission', costPoints: 350, category: 'Clean Energy', description: 'Pool points to sponsor durable solar-rechargeable study lamps for school students in remote non-electrified hamlets in Rajasthan and Ladakh.', impactMetric: 'Displaces 80L kerosene • Safe evening studying', imageEmoji: '☀️' },
    { rewardId: 'rew-water-1', title: 'Restore 500L in Community Rain Wells', organization: 'Rainwater Club Bengaluru', costPoints: 180, category: 'Water Access', description: 'Contribute to digging and maintaining community recharge wells across peri-urban dry zones, replenishing depleted aquifers.', impactMetric: '500L annual recharge capacity added', imageEmoji: '💧' },
    { rewardId: 'rew-gear-1', title: 'Eco Bamboo Travel Cutlery & Straw Set', organization: 'EarthFirst Sustainable Goods', costPoints: 150, category: 'Eco Gear', description: 'Receive an organic hand-carved bamboo fork, spoon, chopsticks, and coconut husk cleaning brush in a natural jute travel pouch.', impactMetric: 'Eliminates 1,000+ disposable plastic forks/year', imageEmoji: '🎋' },
    { rewardId: 'rew-gear-2', title: 'Certified Organic Seed Bomb Trio', organization: 'Green Earth Seed Collaborative', costPoints: 120, category: 'Eco Gear', description: 'Receive a packet of native pollinator seed balls (marigold, tulsi, and wild sunflower) packed in clay and organic compost.', impactMetric: 'Creates 3 mini pollinator stations', imageEmoji: '🌸' },
  ];

  let upserted = 0;
  for (const reward of rewards) {
    await Reward.findOneAndUpdate(
      { rewardId: reward.rewardId },
      { $setOnInsert: reward },
      { upsert: true, new: true }
    );
    upserted++;
  }
  console.log(`  ✓ Rewards: ${upserted} upserted`);
}
