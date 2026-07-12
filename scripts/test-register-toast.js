const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  page.on('dialog', async (dialog) => { throw new Error(`Alerte navigateur interdite: ${dialog.message()}`); });
  await page.goto('http://127.0.0.1:8081');
  await page.getByText("S'inscrire", { exact: true }).click();
  await page.locator('input[placeholder*="email ou"]').fill('client@dizzitup.com');
  await page.locator('input[placeholder*="Créez votre mot de passe"]').fill('Demo123!');
  await page.getByText('Continuer', { exact: true }).click();
  await page.getByText('Inscription réussie', { exact: true }).waitFor();
  await page.getByText('Vérifiez votre compte', { exact: true }).waitFor({ timeout: 5000 });
  console.log('REGISTER APP TOAST -> OTP: OK'); await browser.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
