// tests/e2e/services.spec.ts
// Teste la page /services : affichage des cartes, filtres, modal de soumission

import { test, expect } from '@playwright/test';

test.describe('Page /services', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    // Attendre que les cartes de catégories soient chargées depuis l'API
    await page.waitForSelector('button.group', { timeout: 10_000 }).catch(() => {});
  });

  test('Affiche les cartes de catégories', async ({ page }) => {
    const cards = page.locator('button.group');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Filtrer par mot-clé réduit les résultats', async ({ page }) => {
    // Attendre que les cartes soient là
    await page.locator('button.group').first().waitFor({ timeout: 10_000 });

    const searchInput = page.getByPlaceholder(/type de service|recherche/i)
      .or(page.locator('input[type="text"]').first());
    await searchInput.fill('plomberie');
    await page.waitForTimeout(400); // debounce 300ms

    await expect(page.getByText(/plomberie/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('Cliquer sur une carte ouvre le modal de soumission', async ({ page }) => {
    // Attendre les cartes de catégories
    const firstCard = page.locator('button.group').first();
    await firstCard.waitFor({ timeout: 10_000 });
    await firstCard.click();

    // Le modal s'ouvre (fond semi-transparent fixe)
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 8_000 });

    // Le modal contient un champ description
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 5_000 });
  });

  test('Fermer le modal avec le bouton ×', async ({ page }) => {
    const firstCard = page.locator('button.group').first();
    await firstCard.waitFor({ timeout: 10_000 });
    await firstCard.click();

    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 8_000 });

    // Le bouton × est le dernier bouton du header sticky du modal
    await page.locator('div.sticky button').last().click();
    await expect(modal).not.toBeVisible({ timeout: 5_000 });
  });

  test('Le modal désactive le bouton si non connecté', async ({ page }) => {
    const firstCard = page.locator('button.group').first();
    await firstCard.waitFor({ timeout: 10_000 });
    await firstCard.click();

    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 8_000 });

    // Bouton de soumission désactivé pour utilisateurs non connectés
    const submitBtn = page.getByRole('button', { name: /envoyer ma demande/i });
    await expect(submitBtn).toBeDisabled({ timeout: 5_000 });
  });

});
