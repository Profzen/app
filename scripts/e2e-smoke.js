const { chromium } = require('playwright');

const baseURL = 'http://127.0.0.1:8081';
const browserPath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function clickText(page, text, exact = true) {
  const locator = page.getByText(text, { exact }).filter({ visible: true }).last();
  await locator.scrollIntoViewIfNeeded();
  await locator.click();
  await page.waitForTimeout(350);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: browserPath });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  console.log('LOGIN:', (await page.locator('body').innerText()).slice(0, 500).replaceAll('\n', ' | '));

  const inputs = page.locator('input');
  await inputs.nth(0).fill('demo@dizzitup.com');
  await inputs.nth(1).fill('Demo123!');
  await clickText(page, 'Se connecter');
  await page.getByText('Quick actions', { exact: true }).last().waitFor({ timeout: 10000 });
  console.log('AUTH -> HOME: OK');

  await clickText(page, 'Send');
  await page.getByText('Continuer', { exact: true }).last().click();
  await page.getByText('Suivant', { exact: true }).click();
  for (let i = 0; i < 6; i += 1) {
    await page.getByText('1', { exact: true }).last().evaluate((element) => element.parentElement.click());
    await page.waitForTimeout(100);
  }
  await page.getByText('Confirmer', { exact: true }).click();
  await page.getByText('Terminé', { exact: true }).waitFor();
  await clickText(page, 'Terminé');
  await page.getByText('Quick actions', { exact: true }).last().waitFor();
  console.log('SEND MONEY END-TO-END: OK');

  await clickText(page, 'Cash-out');
  await clickText(page, 'Continuer');
  await clickText(page, 'Continuer');
  await clickText(page, 'Confirmer le retrait');
  await page.getByText('Retrait réussi', { exact: false }).waitFor({ timeout: 7000 });
  await clickText(page, "Retour à l'accueil");
  await page.getByText('Quick actions', { exact: true }).last().waitFor();
  console.log('WITHDRAW END-TO-END: OK');

  await clickText(page, 'Top-up');
  await clickText(page, 'Continuer');
  await clickText(page, 'Continuer');
  await clickText(page, 'Confirmer le paiement');
  await page.getByText('Voir mon portefeuille DZYwallet', { exact: true }).waitFor({ timeout: 7000 });
  console.log('TOP-UP END-TO-END: OK');

  console.log(`RUNTIME ERRORS: ${errors.length}`);
  errors.forEach((error) => console.log(error));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
