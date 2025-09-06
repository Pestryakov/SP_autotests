import { test, BrowserContextOptions, expect } from '@playwright/test';
import { proxy } from '../data/proxy';
import { locatorsAllProject } from '../data/projectsLocators';
import { generateRandomEmailTest, generateRandomPassword } from '../data/genMailAndPass';
import TelegramBot from 'node-telegram-bot-api';

interface ProxyConfig {
  geo: string;
  server: string;
  login: string;
  password: string;
  localybrowser: string;
}

const token: string = '8499698916:AAFMUP4XcMDDjVUkFeUeIqQb-JIVSon3wzg';

const chatIdsWithProjects = [
  { chatId: ['673637144'], projects: ['all'] },
]; 


test('Регистрация нового пользователя и проверка FastDep', async ({ browser }) => {
  test.setTimeout(120000);

  const proxyConfig: ProxyConfig | undefined = proxy.find(
    (config) => config.geo === 'Netherlands'
  );
  if (!proxyConfig) throw new Error('Netherlands proxy not found');

  const [serverHost, port] = proxyConfig.server.split(':');

  const contextOptions: BrowserContextOptions = {
    httpCredentials: {
      username: 'kaasino',
      password: 'SuperPass1',
    },
    locale: proxyConfig.localybrowser,
    ignoreHTTPSErrors: true,
    // proxy: {
    //   server: `http://${serverHost}:${port}`,
    //   username: proxyConfig.login,
    //   password: proxyConfig.password,
    // },
  };

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  const locators = locatorsAllProject.find(p => p.project === 'kaasinoStageWP');
  if (!locators) throw new Error('Locators for project not found');

  // Переход на сайт
  const response = await page.goto('https://stage.kaasino.com', {
    timeout: 80000,
    waitUntil: 'load',
  });
  console.log('🌍 Main page status:', response?.status());

  // Генерация данных
  const email = generateRandomEmailTest();
  const password = generateRandomPassword();

  console.log('📧 Generated email:', email);
  console.log('🔑 Generated password:', password);

  // Регистрация
  await page.click(locators.locatorButtonReg);
  await page.fill(locators.locatorRegFormEmail, email);
  await page.fill(locators.locatorRegFormPassword, password);
  await page.click(locators.locatorRegFormSignUpBtn);

  // Проверка fast dep
  const fastDepBtn = page.locator(locators.locatorFastDepBtn);

  try {
    await expect(fastDepBtn).toBeVisible({ timeout: 60000 });
    console.log('✅ Регистрация прошла успешно, fast dep найден!');
  } catch (err) {
    console.error('❌ Регистрация не удалась, fast dep не найден!');
    throw err; // важно: пробрасываем ошибку, чтобы тест реально упал
  }

  // Скриншот
  await page.screenshot({
    path: `screenshotsStageWP/kaasino_registration_${Date.now()}.png`,
    fullPage: true,
  });

  await context.close();
});
