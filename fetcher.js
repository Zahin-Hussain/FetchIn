const playwright = require('playwright');

async function scrapeLinkedInProfile(profileUrl) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`\n🌀 Attempt ${attempt} of 3`);

    const browser = await playwright.chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(profileUrl)}`;

    try {
      console.log('🔍 Navigating to Google...');
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Handle cookie prompt if needed
      try {
        await page.click('#L2AGLb', { timeout: 2000 });
      } catch (e) {
        // No cookie prompt, ignore
      }

      const captchaDetected = await page.evaluate(() =>
        document.body.innerText.includes("I'm not a robot")
      );

      if (captchaDetected) {
        console.log('🚫 CAPTCHA detected. Restarting browser...');
        await browser.close();
        continue;
      }

      console.log('🔗 Clicking first Google result...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.click('h3')
      ]);

      await page.waitForTimeout(800);
      console.log('🔄 Going back briefly...');
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      console.log('🔁 Clicking Google result again...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.click('h3')
      ]);

      console.log('📸 Taking screenshot...');
      await page.waitForTimeout(3000);
      const filePath = `screenshots/${Date.now()}_profile.png`;
      await page.screenshot({ path: filePath });

      await browser.close();
      return { success: true, file: filePath };
    } catch (err) {
      console.error('⚠️ Error during scraping:', err.message);
      await browser.close();
    }
  }

  return { success: false, message: 'All attempts failed.' };
}

module.exports = scrapeLinkedInProfile;
