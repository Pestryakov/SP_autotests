import { test, BrowserContextOptions, expect } from '@playwright/test';
import { locatorsAllProject } from '../data/projectsLocators';
import { generateRandomEmailTest, generateRandomPassword } from '../data/genMailAndPass';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';
import { proxy, ProxyConfig } from '../data/proxy';
import fs from 'fs';

dotenv.config();

// ────────── Настройка Telegram ──────────
const token: string = process.env.TELEGRAM_TOKEN!;
const bot = new TelegramBot(token, { polling: false });
const chatIds: string[] = [process.env.TELEGRAM_CHAT_ID!];

// ────────── Настройка Slack ──────────
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN_PROD);
const slackChannel = process.env.SLACK_CHANNEL_ID_PROD;

async function sendSlackMessage(message: string, success: boolean, geo: string) {
  try {
    await slackClient.chat.postMessage({
      channel: slackChannel!,
      attachments: [
        {
          color: success ? "good" : "danger",
          text: `*🌍 ${geo}*\n${message}`,
          mrkdwn_in: ["text"],
        },
      ],
    });
    console.log('✅ Сообщение отправлено в Slack (Prod)');
  } catch (err) {
    console.error('❌ Ошибка при отправке в Slack (Prod):', err);
  }
}

test('Регистрация нового пользователя и проверка FastDep (Prod)', async ({ browser }) => {
  const startTime = Date.now();
  test.setTimeout(120000);

  const geo = process.env.PROXY_GEO!;
  const proxyConfig: ProxyConfig | undefined = proxy.find(p => p.geo === geo);
  if (!proxyConfig) throw new Error(`Proxy for geo ${geo} not found`);
  const [serverHost, port] = proxyConfig.server.split(':');

  const contextOptions: BrowserContextOptions = {
    ignoreHTTPSErrors: true,
    locale: proxyConfig.localybrowser,
    proxy: {
      server: `http://${serverHost}:${port}`,
      username: proxyConfig.login,
      password: proxyConfig.password,
    },
  };

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  const locators = locatorsAllProject.find(p => p.project === 'kaasinoStageWP');
  if (!locators) throw new Error('Locators for project not found');

  const response = await page.goto('https://kaasino.com', { timeout: 80000, waitUntil: 'load' });
  console.log('🌍 Main page status:', response?.status());

  const email = generateRandomEmailTest();
  const password = generateRandomPassword();
  console.log('📧 Generated email:', email);
  console.log('🔑 Generated password:', password);

  await page.click(locators.locatorButtonReg);
  await page.fill(locators.locatorRegFormEmail, email);
  await page.fill(locators.locatorRegFormPassword, password);
  await page.click(locators.locatorRegFormSignUpBtn);

  const fastDepBtn = page.locator(locators.locatorFastDepBtn);

  let message: string;
  let success = false;

  try {
    await expect(fastDepBtn).toBeVisible({ timeout: 60000 });
    message = `✅ Регистрация успешна!\n📧 Email: ${email}\n🔑 Password: ${password}\nFastDep после реги найден.`;
    success = true;
    console.log(message);
  } catch (err) {
    message = `❌ Регистрация провалилась!\n📧 Email: ${email}\n🔑 Password: ${password}\nFastDep не найден.`;
    success = false;
    console.error(message);
  }

  await page.waitForTimeout(5000);

  const screenshotDir = 'screenNewRegKaasProd';
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);
  const screenshotPath = `${screenshotDir}/kaasino_registration_${geo}_${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const endTime = Date.now();
  const durationSec = Math.round((endTime - startTime) / 1000);
  const fullMessage = `🌍 <b>${geo}</b>\n${message}\n⏱️ Время выполнения теста: ${durationSec} секунд (~${Math.round(durationSec / 60)} минут)`;

  console.log('⏱️', fullMessage); // лог для GitHub Actions

  // ────────── Отправка в Telegram ──────────
  const sendMessageOptions: SendMessageOptions = {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  for (const chatId of chatIds) {
    await bot.sendMessage(chatId, fullMessage, sendMessageOptions);
  }

  // ────────── Отправка в Slack ──────────
  await sendSlackMessage(fullMessage, success, geo);

  await context.close();
});
