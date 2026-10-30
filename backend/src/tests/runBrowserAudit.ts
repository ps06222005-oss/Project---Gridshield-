import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = 'C:/Users/hp/.gemini/antigravity/brain/6ad3eda4-8f17-4204-9a31-04f09e283e65/screenshots';
const RESULTS_FILE = 'C:/Users/hp/.gemini/antigravity/brain/6ad3eda4-8f17-4204-9a31-04f09e283e65/scratch/browser-test-results.json';

interface StepResult {
  step: string;
  passed: boolean;
  details?: string;
  screenshot?: string;
  durationMs: number;
}

async function runBrowserAudit() {
  console.log('--- STARTING GRIDSHIELD AI AUTOMATED BROWSER AUDIT ---');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const results: {
    mobileSteps: StepResult[];
    desktopSteps: StepResult[];
    consoleErrors: string[];
    consoleWarnings: string[];
    brokenImages: string[];
    horizontalOverflowErrors: string[];
  } = {
    mobileSteps: [],
    desktopSteps: [],
    consoleErrors: [],
    consoleWarnings: [],
    brokenImages: [],
    horizontalOverflowErrors: [],
  };

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MOBILE AUDIT (390 x 844)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[1/2] Executing Mobile Viewport Audit (390 x 844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await mobileContext.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(`[Mobile Console Error] ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      results.consoleWarnings.push(`[Mobile Console Warning] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    results.consoleErrors.push(`[Mobile Uncaught Exception] ${err.message}`);
  });

  async function checkLayoutHealth(screenName: string) {
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    if (hasOverflow) {
      results.horizontalOverflowErrors.push(`Horizontal overflow detected on ${screenName}`);
    }

    const broken = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src || img.getAttribute('alt') || 'unnamed img');
    });
    if (broken.length > 0) {
      results.brokenImages.push(...broken.map((b) => `${screenName}: ${b}`));
    }
  }

  // STEP 1: Welcome Screen
  let start = Date.now();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=GRIDSHIELD AI');
    await checkLayoutHealth('Welcome Screen');
    const welcomeShot = path.join(SCREENSHOT_DIR, '01_mobile_welcome_screen.png');
    await page.screenshot({ path: welcomeShot });
    results.mobileSteps.push({
      step: '1. Welcome Screen Loaded & Earth Hero verified',
      passed: true,
      screenshot: welcomeShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 1: Welcome Screen Loaded');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '1. Welcome Screen Loaded',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 1 failed:', e.message);
  }

  // STEP 2: Region Selector Menu
  start = Date.now();
  try {
    await page.click('button[aria-label="Brand badge and region menu"]');
    await page.waitForSelector('text=Active Grid Node');
    await page.click('text=India (Active)');
    results.mobileSteps.push({
      step: '2. Region Selector Menu interaction',
      passed: true,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 2: Region Selector Menu verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '2. Region Selector Menu',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 2 failed:', e.message);
  }

  // STEP 3: Explore as Guest Mode -> Home Dashboard
  start = Date.now();
  try {
    await page.click('button:has-text("Explore the App (Guest Mode)")');
    await page.waitForSelector('text=Southern Regional Grid');
    await checkLayoutHealth('Home Dashboard');
    const homeShot = path.join(SCREENSHOT_DIR, '02_mobile_home_dashboard.png');
    await page.screenshot({ path: homeShot });
    results.mobileSteps.push({
      step: '3. Enter Guest Mode & Home Dashboard Loaded',
      passed: true,
      screenshot: homeShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 3: Enter Guest Mode -> Home Dashboard Loaded');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '3. Enter Guest Mode & Home Dashboard',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 3 failed:', e.message);
  }

  // STEP 4: Tasks Navigation & Category Filter
  start = Date.now();
  try {
    await page.click('button:has-text("Tasks")');
    await page.waitForSelector('h1:has-text("Eco Habit Quests")');
    await checkLayoutHealth('Tasks Screen');
    // Test Category filter pill
    await page.click('button:has-text("⚡ Energy")');
    const tasksShot = path.join(SCREENSHOT_DIR, '03_mobile_tasks_screen.png');
    await page.screenshot({ path: tasksShot });
    results.mobileSteps.push({
      step: '4. Tasks Screen & Category Filter',
      passed: true,
      screenshot: tasksShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 4: Tasks Screen & Category Filters verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '4. Tasks Screen',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 4 failed:', e.message);
  }

  // STEP 5: Task Details Modal & Task Completion
  start = Date.now();
  try {
    // Reset filter to all quests
    await page.click('button:has-text("All Quests")');
    const taskCard = page.locator('text=Set AC to 24°C or Higher').first();
    await taskCard.click();
    await page.waitForSelector('text=Action Steps');
    const modalShot = path.join(SCREENSHOT_DIR, '04_mobile_task_modal.png');
    await page.screenshot({ path: modalShot });

    // Type note and complete task
    await page.fill('#task-note-input', 'Audited during automated QA run');
    await page.click('button:has-text("Mark Completed")');
    await page.waitForSelector('text=Green Points');
    await checkLayoutHealth('Task Completed');
    results.mobileSteps.push({
      step: '5. Task Details Modal & Task Completion',
      passed: true,
      screenshot: modalShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 5: Task Details Modal & Completion verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '5. Task Details Modal',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 5 failed:', e.message);
  }

  // STEP 6: Badges Screen & Badge Details Modal
  start = Date.now();
  try {
    await page.click('button:has-text("Home")');
    await page.waitForSelector('text=All Badges');
    await page.click('button:has-text("All Badges")');
    await page.waitForSelector('h1:has-text("Eco Badges")');
    await checkLayoutHealth('Badges Screen');
    const badgeShot = path.join(SCREENSHOT_DIR, '05_mobile_badges_screen.png');
    await page.screenshot({ path: badgeShot });

    // Open first badge detail modal
    await page.locator('text=First Step').first().click();
    await page.waitForSelector('button:has-text("Got It")');
    const badgeModalShot = path.join(SCREENSHOT_DIR, '06_mobile_badge_modal.png');
    await page.screenshot({ path: badgeModalShot });
    await page.click('button:has-text("Got It")');

    // Return to home
    await page.click('button[aria-label="Back"]');
    await page.waitForSelector('text=Southern Regional Grid');

    results.mobileSteps.push({
      step: '6. Badges Screen & Badge Details Modal',
      passed: true,
      screenshot: badgeShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 6: Badges Screen & Badge Details Modal verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '6. Badges Screen',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 6 failed:', e.message);
  }

  // STEP 7: Leaderboard Screen
  start = Date.now();
  try {
    await page.click('button:has-text("Leaderboard")');
    await page.waitForSelector('h1:has-text("Community Leaderboard")');
    await checkLayoutHealth('Leaderboard Screen');
    // Toggle scope
    await page.click('button:has-text("Global Eco Hub")');
    await page.click('button:has-text("Local Grid Circle (India)")');
    const lbShot = path.join(SCREENSHOT_DIR, '07_mobile_leaderboard_screen.png');
    await page.screenshot({ path: lbShot });
    // Back to home
    await page.click('button[aria-label="Back"]');
    await page.waitForSelector('text=Southern Regional Grid');

    results.mobileSteps.push({
      step: '7. Leaderboard Screen & Scope Toggle',
      passed: true,
      screenshot: lbShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 7: Leaderboard Screen verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '7. Leaderboard Screen',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 7 failed:', e.message);
  }

  // STEP 8: Learn Screen & Interactive Quiz
  start = Date.now();
  try {
    await page.click('button:has-text("Learn")');
    await page.waitForSelector('h1:has-text("Micro Learning")');
    await checkLayoutHealth('Learn Screen');
    const learnShot = path.join(SCREENSHOT_DIR, '08_mobile_learn_screen.png');
    await page.screenshot({ path: learnShot });

    // Open first lesson modal
    const lessonCard = page.locator('text=Vampire Power & Peak Shifting').first();
    await lessonCard.click();
    await page.waitForSelector('button:has-text("Take Quick Quiz")');
    const lessonModalShot = path.join(SCREENSHOT_DIR, '09_mobile_lesson_modal.png');
    await page.screenshot({ path: lessonModalShot });

    // Take quiz
    await page.click('button:has-text("Take Quick Quiz")');
    await page.waitForSelector('text=Question 1 of');

    // Answer Q1
    await page.locator('button:has-text("5% to 10%")').click();
    await page.click('button:has-text("Next Question")');

    // Answer Q2
    await page.locator('button:has-text("Solar generation is zero and high demand requires firing up polluting peaker plants")').click();
    await page.click('button:has-text("Next Question")');

    // Answer Q3
    await page.locator('button:has-text("Switch off the surge protector / power strip at the wall")').click();
    await page.click('button:has-text("Submit Answers")');

    await page.waitForSelector('text=Quiz Mastered!');
    const quizResultShot = path.join(SCREENSHOT_DIR, '10_mobile_quiz_result.png');
    await page.screenshot({ path: quizResultShot });
    await page.click('button:has-text("Done")');

    results.mobileSteps.push({
      step: '8. Learn Curriculum & Quiz Submission',
      passed: true,
      screenshot: quizResultShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 8: Learn Screen & Interactive Quiz verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '8. Learn Curriculum & Quiz Submission',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 8 failed:', e.message);
  }

  // STEP 9: Rewards Screen & Voucher Claim
  start = Date.now();
  try {
    await page.click('button:has-text("Rewards")');
    await page.waitForSelector('text=Impact Catalog');
    await checkLayoutHealth('Rewards Screen');
    const rewardsShot = path.join(SCREENSHOT_DIR, '11_mobile_rewards_catalog.png');
    await page.screenshot({ path: rewardsShot });

    // Attempt reward redemption if an affordable reward is unlocked
    const redeemBtn = page.locator('button:has-text("Redeem for"):not([disabled])').first();
    if (await redeemBtn.count() > 0 && await redeemBtn.isVisible()) {
      await redeemBtn.click();
    }
    // Switch to vouchers tab
    await page.click('button:has-text("My Vouchers")');
    const vouchersShot = path.join(SCREENSHOT_DIR, '12_mobile_vouchers_tab.png');
    await page.screenshot({ path: vouchersShot });

    results.mobileSteps.push({
      step: '9. Rewards Screen & Voucher Management',
      passed: true,
      screenshot: rewardsShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 9: Rewards Screen verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '9. Rewards Screen',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 9 failed:', e.message);
  }

  // STEP 10: Profile, Activity, Settings, Points History
  start = Date.now();
  try {
    await page.click('button:has-text("Profile")');
    await page.waitForSelector('text=Activity & Preferences');
    await checkLayoutHealth('Profile Screen');

    // Change location
    await page.click('button:has-text("(Change)")');
    await page.click('button:has-text("Delhi NCR")');

    const profileShot = path.join(SCREENSHOT_DIR, '13_mobile_profile_screen.png');
    await page.screenshot({ path: profileShot });

    // Activity Screen
    await page.click('button:has-text("Activity History")');
    await page.waitForSelector('h1:has-text("Activity History")');
    const activityShot = path.join(SCREENSHOT_DIR, '14_mobile_activity_screen.png');
    await page.screenshot({ path: activityShot });
    await page.click('button[aria-label="Back to Profile"]');

    // Points History Screen
    await page.click('button:has-text("Points History")');
    await page.waitForSelector('h1:has-text("Points History")');
    const pointsShot = path.join(SCREENSHOT_DIR, '15_mobile_points_screen.png');
    await page.screenshot({ path: pointsShot });
    await page.click('button[aria-label="Back"]');

    // Settings Screen
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('h1:has-text("Settings & Preferences")');
    const settingsShot = path.join(SCREENSHOT_DIR, '16_mobile_settings_screen.png');
    await page.screenshot({ path: settingsShot });
    await page.click('button:has-text("75 pts")'); // change daily goal
    await page.click('button[aria-label="Back to Profile"]');

    // Return to Welcome Screen
    await page.click('button:has-text("View Welcome Screen")');
    await page.waitForSelector('text=GRIDSHIELD AI');
    const welcomeReturnShot = path.join(SCREENSHOT_DIR, '17_mobile_welcome_return.png');
    await page.screenshot({ path: welcomeReturnShot });

    results.mobileSteps.push({
      step: '10. Profile, Activity, Points, Settings & Sub-screens',
      passed: true,
      screenshot: profileShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Step 10: Profile, Activity, Points & Settings verified');
  } catch (e: any) {
    results.mobileSteps.push({
      step: '10. Profile Screen & Sub-screens',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Step 10 failed:', e.message);
  }

  await mobileContext.close();

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DESKTOP AUDIT (1280 x 800)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[2/2] Executing Desktop Viewport Audit (1280 x 800)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const desktopPage = await desktopContext.newPage();

  start = Date.now();
  try {
    await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await desktopPage.waitForSelector('text=GRIDSHIELD AI');

    const hasOverflow = await desktopPage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    if (hasOverflow) {
      results.horizontalOverflowErrors.push('Horizontal overflow detected on Desktop Welcome');
    }

    const desktopWelcomeShot = path.join(SCREENSHOT_DIR, '18_desktop_welcome.png');
    await desktopPage.screenshot({ path: desktopWelcomeShot });

    // Enter guest mode
    await desktopPage.click('button:has-text("Explore the App (Guest Mode)")');
    await desktopPage.waitForSelector('text=Southern Regional Grid');

    const desktopHomeShot = path.join(SCREENSHOT_DIR, '19_desktop_home_dashboard.png');
    await desktopPage.screenshot({ path: desktopHomeShot });

    results.desktopSteps.push({
      step: 'Desktop Viewport Rendering & Layout Consistency',
      passed: true,
      screenshot: desktopHomeShot,
      durationMs: Date.now() - start,
    });
    console.log('  ✓ Desktop Viewport Audit complete');
  } catch (e: any) {
    results.desktopSteps.push({
      step: 'Desktop Viewport Rendering',
      passed: false,
      details: e.message,
      durationMs: Date.now() - start,
    });
    console.error('  ✗ Desktop failed:', e.message);
  }

  await desktopContext.close();
  await browser.close();

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nResults written to: ${RESULTS_FILE}`);
  console.log('--- BROWSER AUDIT FINISHED ---');
}

runBrowserAudit().catch((e) => {
  console.error('Fatal Browser Audit Error:', e);
  process.exit(1);
});
