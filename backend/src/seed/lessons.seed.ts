/** lessons.seed.ts — Idempotent upsert of all 3 lessons with full quiz data. */
import { Lesson } from '../models/Lesson';

export async function seedLessons() {
  const lessons = [
    {
      lessonId: 'lesson-vampire-power',
      title: 'Vampire Power & Peak Shifting',
      readTimeMinutes: 3, category: 'Energy',
      summary: 'Discover how silent standby currents steal electricity, and why shifting heavy loads off 6 PM - 10 PM transforms grid efficiency.',
      keyPoints: ['Standby loads (vampire draw) account for 5% to 10% of residential electricity.', 'Peak grid demand usually occurs in the late afternoon and evening when domestic and commercial loads overlap.', 'Running heavy appliances like washing machines during morning or solar peak hours significantly cuts coal generation spikes.'],
      content: ['When your TV, microwave, or game console appears asleep, internal transformers and standby LEDs still draw continuous micro-currents. In an average 3-bedroom apartment, this equals having a 40W bulb glowing 24 hours a day, 365 days a year.', 'Moreover, power grids experience extreme strain between 6:00 PM and 10:00 PM. During these peak hours, grid operators must fire up older, carbon-intensive "peaker" plants to prevent brownouts.', 'By turning off master socket switches before retiring for the night and postponing dishwasher or laundry loads to sunny daytime hours, you directly prevent fossil-peaker activation.'],
      bonusPoints: 30,
      quiz: [
        { question: 'What percentage of domestic electricity is typically consumed by vampire/standby power?', options: ['Less than 0.5%', '5% to 10%', 'Over 50%'], correctAnswerIndex: 1, explanation: 'Studies show vampire power consumes between 5% and 10% of typical home electricity.' },
        { question: 'Why are peak grid hours (e.g. 6 PM – 10 PM) particularly carbon-intensive?', options: ['Solar generation is zero and high demand requires firing up polluting peaker plants', 'Power lines lose conductivity at night', 'Electricity rates are always legally frozen'], correctAnswerIndex: 0, explanation: 'At sunset solar energy drops off while lighting, ACs, and cooking peak together, necessitating fast-ramping fossil generators.' },
        { question: 'What is the easiest way to stop phantom load from an entertainment unit?', options: ['Cover the devices with a blanket', 'Switch off the surge protector / power strip at the wall', 'Lower the volume before turning off the TV'], correctAnswerIndex: 1, explanation: 'A switchable power strip cuts off current to all connected peripherals in one click.' },
      ],
    },
    {
      lessonId: 'lesson-water-conservation',
      title: 'The Hidden Water in Daily Habits',
      readTimeMinutes: 4, category: 'Water',
      summary: 'Explore virtual water footprints, tap aerators, and how small bathroom and kitchen adjustments save hundreds of liters each week.',
      keyPoints: ['A standard running tap dispenses 6 to 10 liters of water every minute.', 'Low-cost tap aerators cut flow by up to 50% without reducing perceived water pressure.', 'A single bucket bath uses ~18 liters, while an unmonitored shower easily tops 100 liters.'],
      content: ['Most urban residents underestimate their direct water consumption because piped municipal supply or automatic borehole pumps mask the real volume.', 'Simple habits like turning off the faucet while brushing teeth saves 12 to 16 liters per day per person. Over a year for a family of four, that is over 20,000 liters.', 'Installing an inexpensive foam aerator on your sink taps introduces air bubbles into the water stream. You get a gentle, splash-free wash that uses less than half the water.'],
      bonusPoints: 30,
      quiz: [
        { question: 'How much water can a tap aerator save without reducing practical washing comfort?', options: ['Up to 10%', 'Up to 50%', 'No savings, it only changes color'], correctAnswerIndex: 1, explanation: 'Aerators mix air into the flow stream, reducing water volume by up to 50% while maintaining firm rinsing feel.' },
        { question: 'Compared to a typical 10-minute shower (90-120L), how much water does a 1-bucket bath consume?', options: ['About 15-20 Liters', '70 Liters', '150 Liters'], correctAnswerIndex: 0, explanation: 'A standard household bucket holds 15 to 20 liters, saving over 75% of water per bathing session.' },
        { question: 'Turning off the tap while lathering or brushing for 2 minutes saves approximately:', options: ['1 cup', '12 to 18 liters', '500 milliliters'], correctAnswerIndex: 1, explanation: 'Standard faucets discharge 6-9 L/min, so turning it off saves 12-18 liters each time.' },
      ],
    },
    {
      lessonId: 'lesson-zero-waste-kitchen',
      title: 'Smart Kitchen & Composting Basics',
      readTimeMinutes: 3, category: 'Waste',
      summary: 'Turn kitchen peels and scraps into rich garden soil while preventing anaerobic methane releases from municipal landfills.',
      keyPoints: ['Organic food waste rotting in landfills produces methane, a greenhouse gas 28x more potent than CO₂.', 'Aerobic home composting creates odor-free soil conditioner in 4 to 6 weeks.', 'The golden rule of composting: balance 1 part Greens (wet nitrogen scraps) with 2 parts Browns (dry carbon leaves/cardboard).'],
      content: ['Nearly 50% of municipal solid waste consists of organic kitchen scraps: vegetable peelings, fruit cores, tea leaves, and coffee grounds.', 'When thrown into plastic garbage bags and compressed in landfills, microbes decompose food without oxygen, generating flammable methane gas.', 'With a simple aerated terracotta or plastic compost bin on your balcony, kitchen scraps turn into dark, earthy compost with zero foul odor if you keep adding dry brown leaves or shredded unbleached cardboard.'],
      bonusPoints: 30,
      quiz: [
        { question: 'Why is food waste in sealed landfills worse for the climate than composting?', options: ['It decomposes anaerobically producing potent methane gas', 'It causes earthquakes', 'It changes the color of the sky'], correctAnswerIndex: 0, explanation: 'Methane is up to 28 times more heat-trapping than carbon dioxide over a 100-year timescale.' },
        { question: 'What is considered a "Brown" (carbon-rich) compost ingredient?', options: ['Fresh tomato peels', 'Dry leaves, sawdust, or shredded brown cardboard', 'Wet coffee grounds'], correctAnswerIndex: 1, explanation: 'Dry leaves, plain cardboard, and coconut coir provide the essential carbon needed to balance wet nitrogen scraps.' },
        { question: 'What keeps an active balcony compost bin free of unpleasant odors?', options: ['Spraying synthetic perfumes', 'Sufficient airflow and adequate dry brown matter', 'Leaving it open in heavy rain'], correctAnswerIndex: 1, explanation: 'Aerobic bacteria need oxygen and a balanced brown-to-green ratio to decompose waste cleanly without foul anaerobic smells.' },
      ],
    },
  ];

  let upserted = 0;
  for (const lesson of lessons) {
    await Lesson.findOneAndUpdate(
      { lessonId: lesson.lessonId },
      { $setOnInsert: lesson },
      { upsert: true, new: true }
    );
    upserted++;
  }
  console.log(`  ✓ Lessons: ${upserted} upserted`);
}
