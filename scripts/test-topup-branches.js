const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8081';
async function login(page) { await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.locator('input').nth(0).fill('demo@dizzitup.com'); await page.locator('input').nth(1).fill('Demo123!'); await page.getByText('Se connecter', { exact: true }).click(); await page.getByText('Top-up', { exact: true }).waitFor(); }
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await login(page);
  await page.getByText('Top-up', { exact: true }).click();
  await page.getByText('Carte bancaire', { exact: true }).click();
  await page.getByText('Continuer', { exact: true }).filter({ visible: true }).last().click();
  await page.getByText('Détails de la carte', { exact: true }).waitFor();
  await page.getByText('Continuer', { exact: true }).filter({ visible: true }).last().click();
  await page.getByText('Paiement réussi !', { exact: true }).waitFor({ timeout: 7000 });
  console.log('TOP-UP CARTE -> DETAILS -> PAYMENT -> CONFIRMATION: OK');

  await login(page);
  await page.getByText('Top-up', { exact: true }).click();
  await page.getByText('Mobile Money', { exact: true }).click();
  await page.getByText('Continuer', { exact: true }).filter({ visible: true }).last().click();
  await page.getByText('Entrez vos informations', { exact: true }).waitFor();
  console.log('TOP-UP MOBILE MONEY -> MOBILE DETAILS: OK');
  console.log(`RUNTIME ERRORS: ${errors.length}`);
  await browser.close(); if (errors.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
