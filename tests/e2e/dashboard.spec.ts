// tests/e2e/dashboard.spec.ts
// Teste le dashboard (nécessite TEST_USERNAME et TEST_PASSWORD)

import { test, expect, Page } from '@playwright/test';

const TEST_USER = process.env.TEST_USERNAME ?? '';
const TEST_PASS  = process.env.TEST_PASSWORD  ?? '';

// Helper : se connecter avant les tests
async function login(page: Page) {
  await page.goto('/connexion');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('marie_tremblay').fill(TEST_USER);
  await page.locator('input[type="password"]').first().fill(TEST_PASS);
  await page.getByRole('button', { name: /se connecter/i }).click();
  // Railway cold start peut prendre jusqu'à 60s
  await expect(page).toHaveURL(/dashboard/, { timeout: 60_000 });
  await page.waitForLoadState('networkidle');
}

// Note: test.skip dans chaque test individuellement pour compatibilité Playwright

test.describe('Dashboard (authentifié)', () => {

  test('Charge et affiche le nom de l\'utilisateur', async ({ page }) => {
    test.skip(!TEST_USER || !TEST_PASS, 'Nécessite TEST_USERNAME et TEST_PASSWORD');
    await login(page);
    await expect(page.getByText(/bonjour/i)).toBeVisible();
  });

  test('Les 5 onglets sont accessibles', async ({ page }) => {
    test.skip(!TEST_USER || !TEST_PASS, 'Nécessite TEST_USERNAME et TEST_PASSWORD');
    await login(page);

    const tabs = ['Aperçu', 'Réservations', 'Messages', 'Services', 'Paramètres'];
    for (const tab of tabs) {
      const tabBtn = page.getByRole('button', { name: new RegExp(tab, 'i') })
        .or(page.getByText(new RegExp(tab, 'i'), { exact: false }));
      await expect(tabBtn.first()).toBeVisible();
    }
  });

  test('Onglet Paramètres — formulaire de profil visible', async ({ page }) => {
    test.skip(!TEST_USER || !TEST_PASS, 'Nécessite TEST_USERNAME et TEST_PASSWORD');
    await login(page);

    // Naviguer vers Paramètres
    await page.getByText(/paramètres/i).first().click();

    // "Changer le mot de passe" est unique à la section Sécurité dans Paramètres
    await expect(page.getByRole('button', { name: /changer le mot de passe/i }))
      .toBeVisible({ timeout: 10_000 });
  });

  test('Onglet Messages — liste des conversations', async ({ page }) => {
    test.skip(!TEST_USER || !TEST_PASS, 'Nécessite TEST_USERNAME et TEST_PASSWORD');
    await login(page);
    await page.getByText(/messages/i).first().click();
    await page.waitForTimeout(500);

    // La section messages est visible (vide ou avec des messages)
    const messagesArea = page.getByText(/aucun message|conversation|message/i).first();
    await expect(messagesArea).toBeVisible({ timeout: 5_000 });
  });

  test('Déconnexion redirige vers l\'accueil', async ({ page }) => {
    test.skip(!TEST_USER || !TEST_PASS, 'Nécessite TEST_USERNAME et TEST_PASSWORD');
    await login(page);
    await page.getByRole('button', { name: /déconnexion|se déconnecter/i }).first().click();
    await expect(page).toHaveURL('/', { timeout: 5_000 });
  });

});
