const { chromium } = require('playwright');

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = 'http://127.0.0.1:8081';
const text = (page, value, exact = true) => page.getByText(value, { exact }).filter({ visible: true }).last();
const clickText = async (page, value, exact = true) => { const item = text(page, value, exact); await item.scrollIntoViewIfNeeded(); await item.click(); await page.waitForTimeout(250); };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chrome });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_NETWORK_ACCESS_DENIED')) errors.push(m.text()); });
  await page.goto(base);

  await clickText(page, 'Téléphone');
  await text(page, 'Numéro de téléphone').waitFor();
  const phoneInput = page.locator('input').first();
  if ((await phoneInput.getAttribute('placeholder')) !== 'Entrez votre numéro de téléphone') throw new Error('Le champ téléphone ne change pas correctement.');
  await clickText(page, 'Email');
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await clickText(page, 'Se connecter');
  await text(page, 'Quick actions').waitFor();
  console.log('LOGIN EMAIL/TELEPHONE: OK');

  await clickText(page, 'Pay bills');
  await text(page, 'Sélectionnez un service').waitFor();
  await clickText(page, 'Recharge mobile');
  await text(page, 'Sélectionnez un montant').waitFor();
  await clickText(page, 'Continuer');
  await text(page, 'Payer & envoyer').waitFor();
  console.log('PAY BILLS -> SERVICE -> MOBILE -> REVIEW: OK');

  await page.goto(base);
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await clickText(page, 'Se connecter');
  await clickText(page, 'Contacts');
  await text(page, 'Actions rapides').waitFor();
  const invite = text(page, 'Invitez vos amis', false);
  await invite.waitFor();
  await page.getByLabel("Fermer la bannière d'invitation").click();
  await page.waitForTimeout(300);
  if (await page.getByLabel("Fermer la bannière d'invitation").isVisible().catch(() => false)) throw new Error('La bannière Contacts ne se ferme pas.');
  await clickText(page, 'Recharger\nmobile');
  await text(page, 'Sélectionnez un montant').waitFor();
  console.log('CONTACTS BANNER/ACTIONS: OK');

  await page.goto(base);
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await clickText(page, 'Se connecter');
  await clickText(page, 'Shops');
  await clickText(page, 'Nouveaux shops');
  await text(page, 'Découvrez les commerces récemment ajoutés.').waitFor();
  await clickText(page, 'Catégories');
  await text(page, 'Parcourez les commerces par catégorie.').waitFor();
  console.log('SHOPS SUBNAV: OK');

  await page.goto(base);
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await clickText(page, 'Se connecter');
  await clickText(page, 'Receive');
  await clickText(page, 'SCANNER QR');
  await page.locator('svg[aria-label="QR code de l\'adresse Polygon"]').waitFor();
  await page.getByLabel("Copier l'adresse").last().click();
  await text(page, 'Adresse copiée !').waitFor();
  console.log('REAL QR + COPY: OK');

  console.log(`RUNTIME ERRORS: ${errors.length}`);
  errors.forEach((error) => console.log(error));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
