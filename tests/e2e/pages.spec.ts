// tests/e2e/pages.spec.ts
// Teste que chaque page publique charge correctement (pas de page blanche, pas de crash JS)

import { test, expect } from '@playwright/test';

const PUBLIC_PAGES = [
  { path: '/',                          landmark: /trouvez le bon pro/i },
  { path: '/services',                  landmark: /trouver un pro|service/i },
  { path: '/a-propos',                  landmark: /coupdemain|à propos/i },
  { path: '/connexion',                 landmark: /bon retour/i },
  { path: '/inscription',               landmark: /créer un compte/i },
  { path: '/conditions-utilisation',    landmark: /conditions/i },
  { path: '/politique-confidentialite', landmark: /confidentialit/i },
  { path: '/politique-remboursement',   landmark: /remboursement/i },
  { path: '/mentions-legales',          landmark: /mentions/i },
];

for (const { path, landmark } of PUBLIC_PAGES) {
  test(`Page "${path}" charge sans erreur`, async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', err => jsErrors.push(err.message));

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    // Pas de page blanche (le root React est monté)
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // Pas de crash JS critique
    const criticalErrors = jsErrors.filter(e =>
      !e.includes('clarity') &&
      !e.includes('unpkg') &&
      !e.includes('variables.css') &&
      !e.includes('gsi')
    );
    expect(criticalErrors, `Erreurs JS sur ${path}: ${criticalErrors.join(', ')}`).toHaveLength(0);

    // Titre contient "Coupdemain"
    await expect(page).toHaveTitle(/coupdemain/i, { timeout: 8_000 });

    // Contenu attendu visible
    await expect(page.getByText(landmark).first()).toBeVisible({ timeout: 8_000 });
  });
}

test('Route inconnue → page 404', async ({ page }) => {
  await page.goto('/cette-page-nexiste-pas-du-tout');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/page introuvable/i)).toBeVisible();
  await expect(page.getByText('404')).toBeVisible();
});
