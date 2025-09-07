import { test, BrowserContextOptions, expect } from '@playwright/test';
import { proxy, ProxyConfig } from '../data/proxy';
import { locatorsAllProject } from '../data/projectsLocators';
import { generateRandomEmailTest, generateRandomPassword } from '../data/genMailAndPass';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// ────────── Настройка Telegram ──────────
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN_STAGE!, { polling: false });
const chatIds = [process.env.TELEGRAM_CHAT_ID!];

// ────────── Настройка Slack ──────────
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN_STAGE);
const slackChannel = process.env.SLACK_CHANNEL_ID_STAGE;

async function sendSlackMessage(message: string) {
  try {
    await slackClient.chat.postMessage({
      channel: slackChannel!,
      text: message,
      mrkdwn: true, // включаем markdown
    });
    console.log('✅ Сообщение отправлено в Slack');
  } catch (err) {
    console.error('❌ Ошибка при отправке в Slack:', err);
  }
}

test('Регистрация нового пользователя и проверка FastDep (стейдж)', async ({ browser }) => {
  const startTime = Date.now();
  test.setTimeout(180000);

  // ────────── Настройка прокси ──────────
  const geo = process.env.PROXY_GEO!;
  const proxyConfig: ProxyConfig | undefined = proxy.find(p => p.geo === geo);
  if (!proxyConfig) throw new Error(`Proxy for geo ${geo} not found`);
  const [serverHost, port] = proxyConfig.server.split(':');

  const contextOptions: BrowserContextOptions = {
    httpCredentials: {
      username: process.env.STAGE_HTTP_USER!,
      password: process.env.STAGE_HTTP_PASS!,
    },
    ignoreHTTPSErrors: true,
    locale: proxyConfig.localybrowser,
    proxy: {
      server: `http://${serverHost}:${port}`,
      username: proxyConfig.login,
      password: proxyConfig.password,
    },
  };

  console.log('🌐 Создаём контекст с прокси и HTTP кредами...');
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  const locators = locatorsAllProject.find(p => p.project === 'kaasinoStageWP');
  if (!locators) throw new Error('Locators for project not found');

  const authHeader = 'Basic ' + Buffer.from(
    `${process.env.STAGE_HTTP_USER}:${process.env.STAGE_HTTP_PASS}`
  ).toString('base64');

  console.log('🔑 Устанавливаем HTTP заголовки...');
  await page.setExtraHTTPHeaders({ Authorization: authHeader });

  const response = await page.goto('https://stage.kaasino.com', {
    timeout: 80000,
    waitUntil: 'load',
  });
  console.log('🌍 Main page status:', response?.status(), response?.statusText());
  console.log('🌍 Final URL:', page.url());

  const email = generateRandomEmailTest();
  const password = generateRandomPassword();
  console.log('📧 Generated email:', email);
  console.log('🔑 Generated password:', password);

  try {
    await page.click(locators.locatorButtonReg);
    await page.fill(locators.locatorRegFormEmail, email);
    await page.fill(locators.locatorRegFormPassword, password);
    await page.click(locators.locatorRegFormSignUpBtn);
  } catch (err) {
    console.error('❌ Ошибка при кликах на форме регистрации:', err);
  }

  const fastDepBtn = page.locator(locators.locatorFastDepBtn);
  let messageTelegram: string;
  let messageSlack: string;

  try {
    await expect(fastDepBtn).toBeVisible({ timeout: 60000 });
    // Telegram HTML
    messageTelegram = `✅ Регистрация успешна!\n📧 Email: <b>${email}</b>\n🔑 Password: <b>${password}</b>\nFastDep найден.`;
    // Slack Markdown
    messageSlack = `:white_check_mark: Регистрация успешна!\n:email: Email: *${email}*\n:key: Password: *${password}*\nFastDep найден.`;
  } catch (err) {
    messageTelegram = `❌ Регистрация провалилась!\n📧 Email: <b>${email}</b>\n🔑 Password: <b>${password}</b>\nFastDep не найден.`;
    messageSlack = `:x: Регистрация провалилась!\n:email: Email: *${email}*\n:key: Password: *${password}*\nFastDep не найден.`;
  }

  await page.waitForTimeout(5000);

  const screenshotDir = 'screenNewRegKaasStage';
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);
  const screenshotPath = `${screenshotDir}/kaasino_registration_${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const endTime = Date.now();
  const durationSec = Math.round((endTime - startTime) / 1000);

  const fullMessageTelegram = `${messageTelegram}\n⏱️ Время выполнения теста: ${durationSec} секунд (~${Math.round(durationSec / 60)} минут)`;
  const fullMessageSlack = `${messageSlack}\n:stopwatch: Время выполнения теста: ${durationSec} секунд (~${Math.round(durationSec / 60)} минут)`;

  // ────────── Лог в консоль ──────────
  console.log('⏱️ Результат теста:', fullMessageTelegram);

  // ────────── Отправка сообщений ──────────
  const sendOptionsTelegram: SendMessageOptions = {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  for (const chatId of chatIds) {
    try {
      await bot.sendMessage(chatId, fullMessageTelegram, sendOptionsTelegram);
    } catch (err) {
      console.error(`❌ Ошибка при отправке Telegram для ${chatId}:`, err);
    }
  }

  await sendSlackMessage(fullMessageSlack);

  await context.close();
});
