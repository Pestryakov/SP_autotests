import { test, BrowserContextOptions, expect } from '@playwright/test';
import { proxy } from '../data/proxy';
import { locatorsAllProject } from '../data/projectsLocators';
import { generateRandomEmailTest, generateRandomPassword } from '../data/genMailAndPass';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';

// ───────────────────────────────
// Типы
// ───────────────────────────────
interface ProxyConfig {
  geo: string;
  server: string;
  login: string;
  password: string;
  localybrowser: string;
}

interface ChatProject {
  chatId: string[];   // массив chatId
  projects: string[]; // для каких проектов отправлять
}

// ───────────────────────────────
// Telegram init
// ───────────────────────────────
const token: string = '8499698916:AAFMUP4XcMDDjVUkFeUeIqQb-JIVSon3wzg';
const bot = new TelegramBot(token, { polling: false });

const chatIdsWithProjects: ChatProject[] = [
  { chatId: ['673637144'], projects: ['stageKaas'] },
];

// ───────────────────────────────
// Функция отправки сообщений
// ───────────────────────────────
async function sendMessages(
  bot: TelegramBot,
  chatIdsWithProjects: ChatProject[],
  project: string,
  message: string,
  sendMessageOptions: SendMessageOptions
) {
  for (const entry of chatIdsWithProjects) {
    if (entry.projects.includes('all') || entry.projects.includes(project)) {
      for (const chatId of entry.chatId) {
        try {
          console.log(`📨 Отправка сообщения для chatId: ${chatId}, проект: ${project}`);
          await bot.sendMessage(chatId, message, sendMessageOptions);
          console.log(`✅ Сообщение успешно отправлено для chatId: ${chatId}`);
        } catch (error) {
          console.error(`❌ Ошибка при отправке для chatId: ${chatId}, проект: ${project}`);
        }
      }
    }
  }
}

// ───────────────────────────────
// Тест
// ───────────────────────────────
test('Регистрация нового пользователя и проверка FastDep', async ({ browser }) => {
  test.setTimeout(120000);

  // Настройка прокси
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

  // Локаторы
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

  let message: string;
  try {
    await expect(fastDepBtn).toBeVisible({ timeout: 60000 });
    message = `✅ Регистрация успешна!\n📧 Email: <b>${email}</b>\n🔑 Password: <b>${password}</b>\nFastDep найден.`;
    console.log(message);
  } catch (err) {
    message = `❌ Регистрация провалилась!\n📧 Email: <b>${email}</b>\n🔑 Password: <b>${password}</b>\nFastDep не найден.`;
    console.error(message);
  }

  // Скриншот
  const screenshotPath = `screenNewRegKaasStage/kaasino_registration_${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Отправка уведомления в Telegram
  const sendMessageOptions: SendMessageOptions = {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  await sendMessages(bot, chatIdsWithProjects, 'newRegStageKaas', message, sendMessageOptions);

  await context.close();
});
