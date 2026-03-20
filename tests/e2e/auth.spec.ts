// tests/e2e/auth.spec.ts
// Teste connexion, inscription (erreur volontaire), et accès dashboard

import { test, expect, Page } from '@playwright/test';

const TEST_USER = process.env.TEST_USERNAME ?? '';
const TEST_PASS  = process.env.TEST_PASSWORD  ?? '';

test.describe('Formulaire de connexion', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/connexion');
    await page.waitForLoadState('networkidle');
  });

  test('La page charge et affiche le formulaire', async ({ page }) => {
    // Champ username (placeholder: "marie_tremblay")
    await expect(page.getByPlaceholder('marie_tremblay')).toBeVisible();
    // Champ mot de passe
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });

  test('Identifiants invalides → message d\'erreur', async ({ page }) => {
    await page.getByPlaceholder('marie_tremblay').fill('utilisateur_qui_nexiste_pas');
    await page.locator('input[type="password"]').first().fill('mauvais_mot_de_passe_123');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page.getByText(/identifiants invalides/i)).toBeVisible({ timeout: 10_000 });
  });

  test('Lien "Mot de passe oublié" navigue correctement', async ({ page }) => {
    await page.getByText(/mot de passe oublié/i).click();
    await expect(page).toHaveURL(/mot-de-passe-oublie/);
  });

  test('Lien "S\'inscrire" navigue vers /inscription', async ({ page }) => {
    // Utiliser le lien par son href plutôt que par son texte (apostrophe typographique)
    await page.locator('a[href="/inscription"]').first().click();
    await expect(page).toHaveURL(/inscription/, { timeout: 10_000 });
  });

  test('Connexion avec vrais identifiants → dashboard', async ({ page }) => {
    test.skip(!TEST_USER, 'Nécessite TEST_USERNAME et TEST_PASSWORD');
    await page.getByPlaceholder('marie_tremblay').fill(TEST_USER);
    await page.locator('input[type="password"]').first().fill(TEST_PASS);
    await page.getByRole('button', { name: /se connecter/i }).click();
    // Railway peut prendre jusqu'à 60s au cold start
    await expect(page).toHaveURL(/dashboard/, { timeout: 60_000 });
    await expect(page.getByText(/bonjour/i)).toBeVisible();
  });

});

test.describe('Formulaire d\'inscription', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/inscription');
    await page.waitForLoadState('networkidle');
  });

  test('La page charge avec le sélecteur de rôle', async ({ page }) => {
    await expect(page.getByText(/trouver des services/i)).toBeVisible();
    await expect(page.getByText(/offrir & trouver/i)).toBeVisible();
  });

  test('Mots de passe différents → message d\'erreur', async ({ page }) => {
    // Sélecteurs CSS exacts pour éviter les matches partiels sur "marie"
    await page.locator('input[placeholder="Marie"]').fill('Test');
    await page.locator('input[placeholder="Tremblay"]').fill('User');
    await page.locator('input[placeholder="marie_tremblay"]').fill('test_user_playwright');
    await page.locator('input[placeholder="marie@exemple.ca"]').fill('test@test.ca');
    await page.locator('input[placeholder="Min. 8 caractères"]').fill('password123');
    await page.locator('input[placeholder="Répétez"]').fill('password456');
    await page.getByRole('button', { name: /créer mon compte/i }).click();

    await expect(page.getByText(/mots de passe ne correspondent pas/i)).toBeVisible({ timeout: 5_000 });
  });

  test('Sélectionner le rôle prestataire change le bouton', async ({ page }) => {
    await page.getByText(/offrir & trouver/i).click();
    await expect(page.getByRole('button', { name: /créer mon compte prestataire/i })).toBeVisible();
  });

});
