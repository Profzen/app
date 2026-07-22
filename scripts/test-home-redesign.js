const { chromium } = require('playwright');

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:8081';
const browserPath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function login(page) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await page.getByText('Se connecter', { exact: true }).click();
  await page.getByText('Quick actions', { exact: true }).waitFor({ timeout: 10000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: browserPath });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) errors.push(message.text());
  });

  await login(page);
  for (const label of ['DZY wallet', '125,500.00', 'Mes fonds', 'To-do list', 'Invite friends', 'Quick actions', 'Send cash']) {
    await page.getByText(label, { exact: !['Invite friends', '125,500.00'].includes(label) }).first().waitFor();
  }
  for (const label of ['Buy goods', 'Pay bills', 'Buy / Pay me', 'Send &', 'Top-up DZYwallet', 'Refer a business', 'Source in Africa', 'Send cash']) {
    await page.getByText(label, { exact: label !== 'Send &' }).first().waitFor();
  }
  await page.screenshot({ path: 'home-redesign-review.png', fullPage: true });
  console.log('HOME CONTENT: OK');

  await page.getByText('Mes fonds', { exact: true }).click();
  await page.getByText('Liste des actifs', { exact: true }).waitFor();
  console.log('WALLET -> ASSETS: OK');

  await login(page);
  await page.getByText('View all', { exact: true }).click();
  await page.getByText('Ma To-do list', { exact: true }).waitFor();
  console.log('TODO VIEW ALL: OK');

  await login(page);
  await page.getByText('Pay bills', { exact: true }).click();
  await page.getByText('Choisir un service', { exact: true }).waitFor();
  console.log('PAY BILLS: OK');

  await login(page);
  await page.getByText('Invite friends', { exact: false }).waitFor();
  await page.getByText('Invite now', { exact: true }).click();
  await page.getByText('DZY Rewards', { exact: true }).waitFor();
  console.log('INVITE ACTION: OK');
  console.log(`RUNTIME ERRORS: ${errors.length}`);
  errors.forEach((error) => console.log(error));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
