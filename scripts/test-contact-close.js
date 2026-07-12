const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  await page.goto('http://127.0.0.1:8081');
  await page.locator('input').nth(0).fill('a@b.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await page.getByText('Se connecter', { exact: true }).click();
  await page.getByText('Contacts', { exact: true }).last().click();
  await page.getByLabel("Fermer la bannière d'invitation").click();
  await page.waitForTimeout(500);
  const visible = await page.getByLabel("Fermer la bannière d'invitation").isVisible().catch(() => false);
  console.log(`CONTACT BANNER CLOSE: ${visible ? 'FAILED' : 'OK'}`);
  await page.getByText('Recharger\nmobile', { exact: true }).click();
  await page.getByText('Sélectionnez un montant', { exact: true }).waitFor();
  console.log('CONTACT QUICK ACTION: OK');
  await browser.close();
  if (visible) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
