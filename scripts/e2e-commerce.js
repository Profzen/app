const { chromium } = require('playwright');

async function visibleText(page, text) {
  return page.getByText(text, { exact: true }).filter({ visible: true }).last();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) errors.push(message.text());
  });
  await page.goto('http://127.0.0.1:8081');
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await (await visibleText(page, 'Se connecter')).click();
  await (await visibleText(page, 'Shops')).click();
  await (await visibleText(page, 'Mes shops')).waitFor();
  await page.getByText('1,5 km', { exact: false }).first().evaluate((el) => el.click());
  await (await visibleText(page, 'Voir les produits')).click();
  await (await visibleText(page, 'Achetez-moi ceci')).click();
  await (await visibleText(page, 'Acheter maintenant')).click();
  await (await visibleText(page, 'Continuer')).click();
  await (await visibleText(page, "Confirmer l'achat")).click();
  await (await visibleText(page, 'Simuler la confirmation du paiement')).click();
  await (await visibleText(page, 'Faire un autre paiement')).waitFor();
  console.log('SHOP -> PRODUCT -> ORDER -> PAYMENT -> SUCCESS: OK');
  console.log(`RUNTIME ERRORS: ${errors.length}`);
  errors.forEach((error) => console.log(error));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
