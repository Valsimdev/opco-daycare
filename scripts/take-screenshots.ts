import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://uszxflplsimoivelxtvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzenhmbHBsc2ltb2l2ZWx4dHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDc0MTksImV4cCI6MjEwNDgyMzQxOX0.6QrqX7Zo2EOqy0UmCvMFCCmaBwL3nJs1tcu4juOpgRw';

// Get publishable key
async function getPublishableKey() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: SUPABASE_KEY }
  });
  return SUPABASE_KEY;
}

async function main() {
  const screenshotsDir = path.join(process.cwd(), '.playwright-mcp', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const timestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const screenshot = async (page: any, name: string) => {
    const filePath = path.join(screenshotsDir, `${name}_${timestamp()}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Screenshot saved: ${filePath}`);
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    // Sign up a test staff user
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const testEmail = `teststaff${Date.now()}@opendaycare.com`;
    const testPassword = 'Test123456!';

    console.log('Creating test user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('Sign up error:', authError.message);
    } else {
      console.log('User created:', authData.user?.id);
    }

    // Navigate to login
    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Debug: see what's on the page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Take debug screenshot
    await page.screenshot({ path: path.join(screenshotsDir, `debug-login_${timestamp()}.png`) });

    // Get page text content
    const textContent = await page.evaluate(() => document.body?.innerText?.substring(0, 500));
    console.log('Page text:', textContent);

    // Try different selectors
    const inputs = await page.locator('input').count();
    console.log('Found', inputs, 'inputs');
    for (let i = 0; i < Math.min(inputs, 5); i++) {
      const type = await page.locator('input').nth(i).getAttribute('type').catch(() => 'unknown');
      const name = await page.locator('input').nth(i).getAttribute('name').catch(() => 'unknown');
      console.log(`  Input ${i}: type=${type}, name=${name}`);
    }

    // Try filling the form - use a more robust approach
    await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const loginUrl = page.url();
    console.log('Current URL after login:', loginUrl);

    if (loginUrl.includes('/auth/login')) {
      console.log('Login may have failed, trying to continue anyway...');
    }

    // Screenshot 1: Empty feed state
    console.log('Taking empty feed screenshot...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, 'feed-vacio');

    // Now create some test posts for screenshots
    console.log('Creating test posts...');

    // Get the user's room
    const { data: userData } = await supabase
      .from('users')
      .select('id, daycare_id')
      .eq('email', testEmail)
      .single();

    if (userData?.daycare_id) {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id')
        .eq('daycare_id', userData.daycare_id)
        .single();

      const roomId = roomData?.id;
      const authorId = userData.id;

      // Create post with 1 photo (static)
      const { data: post1 } = await supabase
        .from('posts')
        .insert({
          author_id: authorId,
          room_id: roomId,
          type: 'activity',
          title: 'Actividad de hoy',
          body: 'Los niños disfrutaron de una actividad de pintura muy divertida.',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (post1) {
        await supabase.from('post_photos').insert({
          post_id: post1.id,
          url: 'https://placehold.co/600x400/F6A98E/white?text=Foto+1',
          width: 600,
          height: 400,
          position: 0,
        });

        await supabase.from('post_children').insert({
          post_id: post1.id,
          child_id: '69ded695-30de-4010-87d1-0bd7868469be',
        });
      }

      // Create post with 2 photos (carousel)
      const { data: post2 } = await supabase
        .from('posts')
        .insert({
          author_id: authorId,
          room_id: roomId,
          type: 'meal',
          title: 'Hora de comer',
          body: 'Hoy tuvimos una deliciosa comida: arroz con pollo y ensalada.',
          published_at: new Date(Date.now() - 3600000).toISOString(),
        })
        .select()
        .single();

      if (post2) {
        await supabase.from('post_photos').insert([
          {
            post_id: post2.id,
            url: 'https://placehold.co/600x400/E87EA1/white?text=Comida+1',
            width: 600,
            height: 400,
            position: 0,
          },
          {
            post_id: post2.id,
            url: 'https://placehold.co/600x400/E87EA1/white?text=Comida+2',
            width: 600,
            height: 400,
            position: 1,
          },
        ]);

        await supabase.from('post_children').insert([
          { post_id: post2.id, child_id: '69ded695-30de-4010-87d1-0bd7868469be' },
          { post_id: post2.id, child_id: '34cefbb6-ea4a-458e-81a6-6a81fa7503e2' },
        ]);
      }

      // Create post with 3 photos (carousel)
      const { data: post3 } = await supabase
        .from('posts')
        .insert({
          author_id: authorId,
          room_id: roomId,
          type: 'achievement',
          title: 'Logros del día',
          body: '¡Felicitaciones a los niños por aprender a compartir!',
          published_at: new Date(Date.now() - 7200000).toISOString(),
        })
        .select()
        .single();

      if (post3) {
        await supabase.from('post_photos').insert([
          {
            post_id: post3.id,
            url: 'https://placehold.co/600x400/9BCB3C/white?text=Logro+1',
            width: 600,
            height: 400,
            position: 0,
          },
          {
            post_id: post3.id,
            url: 'https://placehold.co/600x400/9BCB3C/white?text=Logro+2',
            width: 600,
            height: 400,
            position: 1,
          },
          {
            post_id: post3.id,
            url: 'https://placehold.co/600x400/9BCB3C/white?text=Logro+3',
            width: 600,
            height: 400,
            position: 2,
          },
        ]);
      }
    }

    // Refresh feed to see new posts
    console.log('Refreshing feed...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot 2: Feed with posts and static photo
    await screenshot(page, 'feed-con-posts');

    // Screenshot 3: Feed with carousel (scroll to find one)
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);
    await screenshot(page, 'feed-carousel');

    // Open the modal by clicking the "Compartí un momento…" bar
    console.log('Opening create post modal...');
    const modalTrigger = page.locator('text=Compartí un momento…').first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(1000);

      // Screenshot 4: Modal open
      await screenshot(page, 'modal-abierto');

      // Try to select children
      const firstChildCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstChildCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstChildCheckbox.click();
        await page.waitForTimeout(500);

        const secondChildCheckbox = page.locator('input[type="checkbox"]').nth(1);
        if (await secondChildCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
          await secondChildCheckbox.click();
          await page.waitForTimeout(500);
        }

        // Screenshot 5: Modal with children selected
        await screenshot(page, 'modal-seleccion-multiple');
      }
    }

    console.log('All screenshots taken successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main();
