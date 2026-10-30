/** tasks.seed.ts — Idempotent upsert of all 8 eco tasks. */
import { Task } from '../models/Task';

export async function seedTasks() {
  const tasks = [
    {
      taskId: 'task-ac-temp',
      title: 'Set AC to 24°C or Higher',
      category: 'energy', difficulty: 'Easy', points: 20,
      impactLabel: 'Save 1.2 kWh/day',
      co2SavedKg: 0.98, energySavedKwh: 1.2, waterSavedL: 0, durationMinutes: 1,
      description: 'Every degree above 21°C reduces air conditioner power consumption by 6%. Setting your thermostat to 24°C keeps rooms comfortable while easing the local grid during peak hours.',
      whyItMatters: 'Cooling contributes up to 45% of peak electrical demand in urban Indian homes during warm periods. Small setpoint tweaks directly relieve overburdened transformers.',
      actionSteps: ['Locate your AC remote or thermostat control.', 'Set temperature to 24°C (or 25°C with a ceiling fan on low).', 'Ensure room doors and windows are tightly sealed.'],
      isDaily: true, isActive: true,
    },
    {
      taskId: 'task-standby-unplug',
      title: 'Switch Off Vampire Power at Night',
      category: 'energy', difficulty: 'Easy', points: 15,
      impactLabel: 'Save 0.5 kWh',
      co2SavedKg: 0.41, energySavedKwh: 0.5, waterSavedL: 0, durationMinutes: 3,
      description: 'Phantom power from TVs, set-top boxes, microwave displays, and computer chargers draws power even when devices are off.',
      whyItMatters: 'Idle power accounts for up to 8% of residential electricity bills without delivering any actual utility.',
      actionSteps: ['Switch off power strips connecting the TV and entertainment console.', 'Unplug laptop and mobile chargers left plugged into empty wall outlets.', 'Turn off the microwave wall switch before sleeping.'],
      isDaily: true, isActive: true,
    },
    {
      taskId: 'task-cold-wash',
      title: 'Wash Laundry in Cold Water',
      category: 'water', difficulty: 'Easy', points: 25,
      impactLabel: 'Save 0.8 kWh',
      co2SavedKg: 0.65, energySavedKwh: 0.8, waterSavedL: 12, durationMinutes: 5,
      description: 'Around 75-90% of the energy consumed by a washing machine goes into heating water. Cold water wash cycles clean everyday clothes just as effectively.',
      whyItMatters: 'Saves household electricity while extending the lifespan and color vibrancy of your natural cottons and fabrics.',
      actionSteps: ['Set your washing machine cycle temperature to Eco / Cold (30°C or tap temperature).', 'Run only when you have a full load to conserve both water and electricity.'],
      isDaily: true, isActive: true,
    },
    {
      taskId: 'task-bucket-bath',
      title: 'Mindful 1-Bucket Bath or 4-Min Shower',
      category: 'water', difficulty: 'Medium', points: 30,
      impactLabel: 'Save 45 Liters Water',
      co2SavedKg: 0.22, energySavedKwh: 0.3, waterSavedL: 45, durationMinutes: 10,
      description: 'A conventional 10-minute shower can consume over 90-120 liters of fresh water. Using a traditional bucket bath or keeping showers under 4 minutes cuts usage in half.',
      whyItMatters: 'In rapidly expanding cities like Bengaluru, Chennai, and Delhi, groundwater replenishment is critical. Every saved liter preserves local reservoir levels.',
      actionSteps: ['Fill a single 15-20L bucket or set a 4-minute timer on your phone.', 'Turn off the tap while lathering or shampooing.'],
      isDaily: true, isActive: true,
    },
    {
      taskId: 'task-reusable-bag',
      title: 'Bring Reusable Tote & Refill Bottle',
      category: 'waste', difficulty: 'Easy', points: 15,
      impactLabel: 'Prevent 2 Single-Use Plastics',
      co2SavedKg: 0.18, energySavedKwh: 0.1, waterSavedL: 5, durationMinutes: 2,
      description: 'Keep a compact cloth tote and stainless steel water bottle in your daily bag so you never need single-use plastic carry bags or mineral water bottles.',
      whyItMatters: 'Single-use plastic bags take centuries to degrade, blocking urban stormwater drains and polluting soil ecosystems.',
      actionSteps: ['Tuck a folded cotton tote bag inside your work or shopping bag.', 'Refill a durable bottle before stepping out of your home or workspace.'],
      isDaily: true, isActive: true,
    },
    {
      taskId: 'task-plant-meal',
      title: 'Enjoy a 100% Plant-Powered Meal',
      category: 'food', difficulty: 'Medium', points: 35,
      impactLabel: 'Avoid 1.8kg CO₂e',
      co2SavedKg: 1.8, energySavedKwh: 0.5, waterSavedL: 180, durationMinutes: 25,
      description: 'Choose a delicious wholesome seasonal plant-based meal (like dal tadka, roasted seasonal vegetables, millet roti, or vegetable biryani).',
      whyItMatters: 'Plant-centric diets require dramatically less cropland, irrigation water, and nitrogen fertilizer per calorie than livestock farming.',
      actionSteps: ['Pick locally harvested pulses, seasonal greens, and whole grains.', 'Savor a fresh, nutrient-dense meal prepared with zero red meat or processed dairy.'],
      isDaily: true, isActive: true,
    },
    {
      taskId: 'task-metro-walk',
      title: 'Green Commute: Walk, Cycle or Metro',
      category: 'commute', difficulty: 'Challenging', points: 40,
      impactLabel: 'Avoid 2.4kg CO₂e',
      co2SavedKg: 2.4, energySavedKwh: 1.8, waterSavedL: 0, durationMinutes: 30,
      description: 'Replace a single-occupancy petrol/diesel cab or personal car trip with the metro, bus, bicycle, or brisk walking for short trips under 3 km.',
      whyItMatters: 'Urban transport is the fastest-growing source of air pollutants in metropolitan hubs. Public transit reduces vehicular congestion and tailpipe smog.',
      actionSteps: ['Take the metro or city electric bus for your commute.', 'For trips under 2 km, choose brisk walking or shared bicycles.'],
      isDaily: true, isActive: true,
    },
    {
      taskId: 'task-natural-light',
      title: 'Daylight Hour: Lights Off During Noon',
      category: 'habits', difficulty: 'Easy', points: 15,
      impactLabel: 'Save 0.3 kWh',
      co2SavedKg: 0.24, energySavedKwh: 0.3, waterSavedL: 0, durationMinutes: 60,
      description: 'Open curtains and blinds to let sunlight illuminate your room, keeping all ceiling fixtures and desk lamps turned off during peak daylight hours.',
      whyItMatters: 'Harnessing natural daylight promotes circadian rhythm alignment while lightening electrical baseline consumption.',
      actionSteps: ['Draw open window blinds and sheer curtains.', 'Switch off non-essential overhead LED fixtures.'],
      isDaily: true, isActive: true,
    },
  ];

  let upserted = 0;
  for (const task of tasks) {
    await Task.findOneAndUpdate(
      { taskId: task.taskId },
      { $setOnInsert: task },
      { upsert: true, new: true }
    );
    upserted++;
  }
  console.log(`  ✓ Tasks: ${upserted} upserted`);
}
