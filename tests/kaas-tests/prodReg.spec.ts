import { test, BrowserContextOptions, expect } from '@playwright/test';
import { locatorsAllProject } from '../data/projectsLocators';
import { generateRandomEmailTest, generateRandomPassword } from '../data/genMailAndPass';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { proxy, ProxyConfig } from '../data/proxy';
import fs from 'fs';

// Загружаем переменные из .env
dotenv.config();

// ───────────────────────────────
// Telegram init
// ───────────────────────────────
const token: string = process.env.TELEGRAM_TOKEN!;
const bot = new TelegramBot(token, { polling: false });
const chatIds: string[] = [process.env.TELEGRAM_CHAT_ID!];

// ───────────────────────────────
// Тест
// ───────────────────────────────
test('Регистрация нового пользователя и проверка FastDep', async ({ browser }) => {
  test.setTimeout(120000);

  // Берём прокси по гео из .env
  const geo = process.env.PROXY_GEO!;
  const proxyLogin = process.env.PROXY_LOGIN!;
  const proxyPass = process.env.PROXY_PASS!;

  const proxyConfig: ProxyConfig | undefined = proxy.find(p => p.geo === geo);
  if (!proxyConfig) throw new Error(`Proxy for geo ${geo} not found`);

  const [serverHost, port] = proxyConfig.server.split(':');

  const contextOptions: BrowserContextOptions = {
    ignoreHTTPSErrors: true,
    locale: proxyConfig.localybrowser,
    proxy: {
      server: `http://${serverHost}:${port}`,
      username: proxyLogin,
      password: proxyPass,
    },
  };

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  // Локаторы
  const locators = locatorsAllProject.find(p => p.project === 'kaasinoStageWP');
  if (!locators) throw new Error('Locators for project not found');

  // Переход на сайт
  const response = await page.goto('https://kaasino.com', { timeout: 80000, waitUntil: 'load' });
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

  let message: string;
  try {
    await expect(fastDepBtn).toBeVisible({ timeout: 60000 });
    message = `✅ Регистрация успешна!\n📧 Email: <b>${email}</b>\n🔑 Password: <b>${password}</b>\nFastDep найден.`;
    console.log(message);
  } catch (err) {
    message = `❌ Регистрация провалилась!\n📧 Email: <b>${email}</b>\n🔑 Password: <b>${password}</b>\nFastDep не найден.`;
    console.error(message);
    throw err;
  }

  // Создаём папку для скриншотов, если её нет
  const screenshotDir = 'screenNewRegKaasProd';
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

  const screenshotPath = `${screenshotDir}/kaasino_registration_${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Отправка уведомления в Telegram
  const sendMessageOptions: SendMessageOptions = {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  for (const chatId of chatIds) {
    await bot.sendMessage(chatId, message, sendMessageOptions);
  }

  await context.close();
});
