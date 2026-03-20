// tests/e2e/global-setup.ts
// Réveille le backend Railway avant de lancer les tests (cold start peut prendre 30-60s)

import { request } from '@playwright/test';

const RAILWAY_URL = process.env.RAILWAY_URL ?? 'https://web-production-4f9cb.up.railway.app';

export default async function globalSetup() {
  console.log('\n🔄 Warmup Railway backend...');
  const start = Date.now();

  const ctx = await request.newContext({ baseURL: RAILWAY_URL });

  // Retry jusqu'à 120s le temps que Railway se réveille
  const MAX_WAIT = 120_000;
  const INTERVAL = 3_000;
  let lastError = '';

  while (Date.now() - start < MAX_WAIT) {
    try {
      const res = await ctx.get('/api/categories/', { timeout: 10_000 });
      if (res.ok()) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`✅ Railway prêt en ${elapsed}s`);

        // Ping aussi l'endpoint auth pour le sortir du froid
        await ctx.post('/api/auth/login/', {
          data: { username: '_warmup_', password: '_warmup_' },
          timeout: 15_000,
        }).catch(() => {}); // 400/401 attendu, on ignore
        console.log('✅ Auth endpoint pingé\n');

        await ctx.dispose();
        return;
      }
      lastError = `HTTP ${res.status()}`;
    } catch (e: any) {
      lastError = e.message?.slice(0, 60) ?? 'timeout';
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, INTERVAL));
  }

  await ctx.dispose();
  console.warn(`\n⚠️  Railway pas encore prêt après ${MAX_WAIT / 1000}s (${lastError}) — les tests continuent quand même\n`);
}
