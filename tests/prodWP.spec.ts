import { test, BrowserContextOptions } from '@playwright/test';
import { proxy } from './data/proxy';

interface ProxyConfig {
  geo: string;
  server: string;
  login: string;
  password: string;
  localybrowser: string;
}

test('Access stage.kaasino.com with Netherlands proxy and take screenshot', async ({ browser }) => {
  test.setTimeout(90000);

  const proxyConfig: ProxyConfig | undefined = proxy.find(
    (config) => config.geo === 'Netherlands'
  );
  if (!proxyConfig) throw new Error('Netherlands proxy not found');

  const [serverHost, port] = proxyConfig.server.split(':');

  const contextOptions: BrowserContextOptions = {
    locale: proxyConfig.localybrowser,
    ignoreHTTPSErrors: true,
   
    proxy: {
      server: `http://${serverHost}:${port}`,
      username: proxyConfig.login,
      password: proxyConfig.password,
    },
  };

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  // 🟢 Лог всех картинок
  page.on('response', async (resp) => {
    if (resp.request().resourceType() === 'image') {
      console.log('Image:', resp.url(), resp.status());
    }
  });

  const response = await page.goto('https://kaasino.com', {
    timeout: 80000,
    waitUntil: 'load',
  });
  console.log('Main page status:', response?.status());

  await page.waitForTimeout(10000);

  await page.screenshot({
    path: `screenshotsProdWP/kaasino_screenshot_${test.info().project.name.replace(/ /g, "_")}.png`,
    fullPage: true,
  });

  await context.close();
}); 