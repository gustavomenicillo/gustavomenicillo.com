const { chromium, devices } = require('playwright');
(async () => {
  const S = process.argv[2];
  const b = await chromium.launch();
  for (const [name, opts] of [['movil', devices['iPhone 13']], ['compu', { viewport: { width: 1280, height: 800 } }]]) {
    const ctx = await b.newContext({ ...opts, hasTouch: true });
    const p = await ctx.newPage();
    p.on('console', m => console.log(name, 'console:', m.text()));
    p.on('pageerror', e => console.log(name, 'ERR', e.message));
    await p.goto('http://localhost:8787/');
    await p.evaluate(() => scrollTo(0, 500));
    await p.waitForSelector('.fbw-fab');
    await p.screenshot({ path: `${S}/e-${name}-1.png` });
    await p.click('.fbw-fab');
    await p.waitForSelector('.fbw-layer canvas');
    await p.waitForTimeout(300);
    const box = await p.locator('.fbw-stage canvas').nth(1).boundingBox();
    await p.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
    await p.mouse.down();
    for (let i = 0; i <= 10; i++) await p.mouse.move(box.x + box.width * (0.2 + i * 0.05), box.y + box.height * (0.3 + (i % 2) * 0.02));
    await p.mouse.up();
    await p.fill('.fbw-sheet textarea', `Cambiar este párrafo (${name})`);
    await p.screenshot({ path: `${S}/e-${name}-2.png` });
    await p.click('.fbw-btn.pri');
    await p.waitForSelector('.fbw-toast');
    await p.screenshot({ path: `${S}/e-${name}-3.png` });
    await ctx.close();
  }
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8787/__feedback/');
  await p.waitForSelector('.card');
  await p.click('[data-more]');
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${S}/e-bandeja.png`, fullPage: true });
  await b.close();
})();
