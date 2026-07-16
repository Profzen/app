const { chromium } = require('playwright');

const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:8081';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const visibleText = (page, value, exact = true) => page.getByText(value, { exact }).filter({ visible: true }).last();

async function login(page) {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('input').nth(0).fill('demo@dizzitup.com');
  await page.locator('input').nth(1).fill('Demo123!');
  await visibleText(page, 'Se connecter').click();
  await visibleText(page, 'Quick actions').waitFor();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chrome });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) errors.push(message.text());
  });

  await login(page);
  await visibleText(page, 'Top-up').click();
  await visibleText(page, 'Carte bancaire').click();
  await visibleText(page, 'Continuer').click();
  await visibleText(page, 'Détails de la carte').waitFor();
  const cardInput = page.locator('input:visible').first();
  await cardInput.fill('5555444433331111');
  if ((await cardInput.inputValue()) !== '5555 4444 3333 1111') throw new Error('Le numéro de carte ne peut pas être remplacé librement.');
  await page.getByLabel("Choisir le mois et l'année").click();
  await visibleText(page, '12').click();
  await visibleText(page, /Utiliser 12 \/ \d{2}/, false).click();
  await page.getByLabel('Choisir la devise').click();
  await visibleText(page, 'EURC').click();
  await page.getByLabel('Choisir le réseau de transaction').click();
  await visibleText(page, 'Polygon').click();
  console.log('CARTE EDITABLE + EXPIRATION + SELECTEURS: OK');

  await login(page);
  await visibleText(page, 'Shops').click();
  await page.getByText('1,5 km', { exact: false }).first().evaluate((element) => element.click());
  await visibleText(page, 'Voir les produits').click();
  await visibleText(page, 'Avis').click();
  await visibleText(page, 'Avis clients').waitFor();
  await visibleText(page, 'Infos').click();
  await visibleText(page, 'Informations pratiques').waitFor();
  await visibleText(page, 'Boutique').click();
  await visibleText(page, 'À propos de la boutique').waitFor();
  await visibleText(page, 'Produits').click();
  await visibleText(page, 'Téléphones & Tablettes').click();
  await visibleText(page, 'Samsung Galaxy A14', false).waitFor();
  console.log('ONGLETS + FILTRES BOUTIQUE: OK');

  await login(page);
  await visibleText(page, 'More').click();
  await visibleText(page, 'Voir tout', false).first().click();
  await visibleText(page, 'Liste des actifs').waitFor();
  await visibleText(page, 'Stablecoins').click();
  await visibleText(page, 'USDC').waitFor();
  if (await page.getByText('BTC', {exact:true}).filter({visible:true}).count()) throw new Error('Le filtre Stablecoins conserve BTC.');
  await visibleText(page, 'Crypto').click();
  await visibleText(page, 'BTC').waitFor();
  if (await page.getByText('USDC', {exact:true}).filter({visible:true}).count()) throw new Error('Le filtre Crypto conserve USDC.');
  await visibleText(page, 'Favoris').click();
  await visibleText(page, 'DZY').waitFor();
  if (await page.getByText('BTC', {exact:true}).filter({visible:true}).count()) throw new Error('Le filtre Favoris conserve un actif non favori.');
  console.log('FILTRES ACTIFS CRYPTO/STABLECOINS/FAVORIS: OK');
  await page.getByLabel('Voir la présentation détaillée du portefeuille').click();
  await visibleText(page, 'Liste des actifs').waitFor();
  console.log('ECRAN ACTIFS SECONDAIRE RELIE: OK');

  await login(page);
  await visibleText(page, 'Contacts').click();
  await visibleText(page, 'Afficher moins').click();
  await visibleText(page, 'John Doe').waitFor();
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (fromX, toX, y) => {
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x:fromX,y}]});
    for (let step = 1; step <= 10; step += 1) await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x:fromX + ((toX - fromX) * step / 10),y}]});
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
  };
  let contactBox = await visibleText(page, 'John Doe').boundingBox();
  await swipe(370, 80, contactBox.y + contactBox.height / 2);
  await visibleText(page, 'Favoris').waitFor();
  await visibleText(page, 'John Doe').click();
  contactBox = await visibleText(page, 'John Doe').boundingBox();
  await swipe(200, 400, contactBox.y + contactBox.height / 2);
  await visibleText(page, 'Inviter').waitFor();
  console.log('SWIPE CONTACTS GAUCHE/DROITE: OK');

  console.log(`RUNTIME ERRORS: ${errors.length}`);
  errors.forEach((error) => console.log(error));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
