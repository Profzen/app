const { chromium } = require('playwright');

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:8081';
const browserPath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function loginAndOpenSettings(page) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await page.getByText('Se connecter', { exact: true }).click();
  await page.getByText('Quick actions', { exact: true }).waitFor();
  await page.getByText('More', { exact: true }).last().click();
  await page.getByLabel('Ouvrir les paramètres').click();
  await page.getByText('Manage your account and preferences', { exact: true }).waitFor();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: browserPath });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) errors.push(message.text());
  });

  await loginAndOpenSettings(page);
  for (const label of ['David Mensah', 'Account setting', 'Personal account', 'Business account', 'Ask Aminata', 'DizzyFamily Loyalty Program', 'About DizzitUp', 'Contact us', 'Log out']) {
    await page.getByText(label, { exact: true }).waitFor();
  }
  await page.screenshot({ path: 'more-settings-review.png', fullPage: true });
  console.log('MORE SETTINGS CONTENT: OK');

  await page.getByText('DizzyFamily Loyalty Program', { exact: true }).click();
  await page.getByText('DZY Rewards', { exact: true }).waitFor();
  console.log('LOYALTY -> REWARDS: OK');

  await loginAndOpenSettings(page);
  await page.getByText('Ask Aminata', { exact: true }).click();
  await page.getByText('The virtual assistant is ready for the client simulation.', { exact: true }).waitFor();
  console.log('ASSISTANT SIMULATION: OK');

  await page.getByText('Log out', { exact: true }).click();
  await page.getByText('Se connecter', { exact: true }).waitFor();
  console.log('LOGOUT: OK');

  console.log(`RUNTIME ERRORS: ${errors.length}`);
  errors.forEach((error) => console.log(error));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
