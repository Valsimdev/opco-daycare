import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, '.playwright-mcp', 'screenshots');

fs.mkdirSync(screenshotDir, { recursive: true });

function timestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '_');
}

async function screenshot(page, name) {
  const filename = `${name}_${timestamp()}.png`;
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Debug: check what's on the page
    console.log(`URL: ${page.url()}`);
    const title = await page.title();
    console.log(`Title: ${title}`);
    
    // Take initial screenshot
    await screenshot(page, 'login_page_loaded');
    
    // Try different selectors
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (emailInput) {
      console.log('Found email input');
      await emailInput.fill('staff@test.com');
    } else {
      console.log('Email input not found, trying alternate selectors...');
      const inputs = await page.$$('input');
      console.log(`Found ${inputs.length} inputs`);
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type');
        const name = await inputs[i].getAttribute('name');
        const placeholder = await inputs[i].getAttribute('placeholder');
        console.log(`  Input ${i}: type=${type}, name=${name}, placeholder=${placeholder}`);
      }
      if (inputs.length >= 2) {
        await inputs[0].fill('staff@test.com');
        await inputs[1].fill('test123456');
      }
    }
    
    if (passwordInput) {
      console.log('Found password input');
      await passwordInput.fill('test123456');
    }
    
    // Find and click submit
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      console.log('Found submit button, clicking...');
      await submitBtn.click();
    } else {
      console.log('Submit button not found');
    }
    
    await page.waitForTimeout(5000);
    console.log(`After login: ${page.url()}`);
    await screenshot(page, 'after_login_attempt');
    
    // If still on login, try direct navigation
    if (page.url().includes('/auth/')) {
      console.log('Login failed, trying direct navigation...');
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
      console.log(`Direct nav result: ${page.url()}`);
      await screenshot(page, 'staff_page_direct');
    }
    
    // Now try to find and interact with the page
    const bodyText = await page.textContent('body');
    console.log(`Body text preview: ${bodyText?.substring(0, 200)}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

main();
