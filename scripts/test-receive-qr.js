const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, permissions: ['clipboard-read', 'clipboard-write'] });
  await page.goto('http://127.0.0.1:8081');
  await page.locator('input').nth(0).fill('a@b.com'); await page.locator('input').nth(1).fill('Demo123!');
  await page.getByText('Se connecter', { exact: true }).click();
  await page.getByText('Receive', { exact: true }).click();
  await page.getByText('SCANNER QR', { exact: true }).click();
  await page.locator("svg[aria-label=\"QR code de l'adresse Polygon\"]").waitFor();
  await page.getByLabel("Copier l'adresse").last().click();
  await page.getByText('Adresse copiée !', { exact: true }).waitFor();
  console.log('RECEIVE QR/COPY: OK'); await browser.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
