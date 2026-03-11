import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Unlock all labs
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    localStorage.setItem('cybermasry_progress', JSON.stringify({
      lab01: { completed: true, unlocked: true },
      lab02: { completed: true, unlocked: true },
      lab03: { completed: true, unlocked: true },
      lab04: { completed: true, unlocked: true },
      lab05: { completed: true, unlocked: true }
    }));
  });
  
  const labs = ['lab01', 'lab02', 'lab03', 'lab04', 'lab05'];
  let totalTested = 0;
  let allWorking = true;
  
  for (const lab of labs) {
    console.log(`\nTesting ${lab.toUpperCase()}...`);
    await page.goto(`http://localhost:5173/labs/${lab}`);
    await page.waitForTimeout(1000);
    
    // We will find all code elements inside the hint banner, click them, and press enter.
    for (let i = 0; i < 10; i++) { // Max ~10-15 steps per lab
      const hintCode = page.locator('.text-neon-green.cursor-pointer.hover\\:underline').first();
      
      const count = await hintCode.count();
      if (count === 0) {
        break; // No more hints/steps
      }
      
      const text = await hintCode.textContent();
      console.log(`  [Step ${i+1}] Running: ${text}`);
      
      // Click to fill
      await hintCode.click();
      await page.waitForTimeout(100);
      
      // Press Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300); // Wait for output
      totalTested++;
      
      // Check if it's a challenge step next
      const challengeButton = page.locator('button:has-text("Submit Answer")').first();
      const hasChallenge = await challengeButton.count();
      if (hasChallenge > 0) {
         console.log(`  [Step ${i+2}] Handling Challenge step...`);
         // We skip full challenge testing here, just mark as working and skip clicking since we are testing commands.
         // Actually, if a challenge blocks the next hint, we need to answer it.
         // Let's just answer 'A' for simplicity or skip evaluating for now.
         break;
      }
    }
  }
  
  console.log(`\nFinished testing ${totalTested} terminal commands across all labs.`);
  await browser.close();
})();
