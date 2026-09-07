// Usage: node .scratch-authshoot.cjs <email> <password> <outDir> [device]
// Logs in via the real /auth form, then screenshots a fixed list of authenticated routes.
const { chromium, devices } = require('playwright');
const path = require('path');

const [, , email, password, outDir, device] = process.argv;

const ROUTES = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/cart', name: 'cart' },
  { path: '/my-orders', name: 'my-orders' },
  { path: '/favorites', name: 'favorites' },
  { path: '/profile', name: 'profile' },
];

async function settle(page) {
  await page.waitForTimeout(1200);
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

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

  await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]:has-text("Sign in")');

  await page.waitForTimeout(4000);
  const url = page.url();
  console.log('post-login url:', url);

  for (const route of ROUTES) {
    try {
      await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await settle(page);
      const suffix = device && device !== 'desktop' ? '-mobile' : '-desktop';
      await page.screenshot({ path: path.join(outDir, `${route.name}${suffix}.png`), fullPage: true });
      console.log(`shot: ${route.name}`);
    } catch (e) {
      console.log(`FAILED: ${route.name} — ${e.message}`);
    }
  }

  if (errors.length) {
    console.log('--- console/page errors (last 30) ---');
    console.log(errors.slice(-30).join('\n'));
  } else {
    console.log('no console errors across the session');
  }

  await browser.close();
})().catch((e) => { console.error('SCRIPT FAILED:', e); process.exit(1); });
