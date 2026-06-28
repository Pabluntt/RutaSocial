import { expect, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe('flujo autenticado web', () => {
  test.skip(!email || !password, 'Configura E2E_EMAIL y E2E_PASSWORD para ejecutar E2E autenticado real.');

  test('login y navegación principal funcionan', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(email as string);
    await page.getByLabel('Contraseña').fill(password as string);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page).toHaveURL(/\/calendario/);
    await expect(page.getByText(/calendario|evento|ruta/i).first()).toBeVisible();

    await page.goto('/mapa');
    await expect(page.locator('.leaflet-container')).toBeVisible();

    await page.goto('/historial');
    await expect(page.getByText(/historial|ruta/i).first()).toBeVisible();

    await page.goto('/perfil');
    await expect(page.getByText(/perfil|nombre|email/i).first()).toBeVisible();
  });
});
