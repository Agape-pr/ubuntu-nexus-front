// Usage: node .scratch-shoot.js <url> <outfile> [device]
const { chromium, devices } = require('playwright');

const [, , url, outfile, device] = process.argv;

(async () => {
  const browser = await chromium.launch();
  const contextOpts = device && device !== 'desktop'
    ? { ...devices[device] }
    : { viewport: { width: 1440, height: 900 } };
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  await page.screenshot({ path: outfile, fullPage: true });

  if (errors.length) {
    console.log('--- console/page errors ---');
    console.log(errors.slice(0, 20).join('\n'));
  } else {
    console.log('no console errors');
  }

  await browser.close();
})().catch((e) => { console.error('SCRIPT FAILED:', e); process.exit(1); });
