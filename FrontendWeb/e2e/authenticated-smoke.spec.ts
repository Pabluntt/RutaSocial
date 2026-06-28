import { expect, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe('flujo autenticado web', () => {
  test.skip(!email || !password, 'Configura E2E_EMAIL y E2E_PASSWORD para ejecutar E2E autenticado real.');

  test.beforeEach(async ({ page }) => {
    page.on('console', (message) => {
      const text = message.text();
      if (
        message.type() === 'error' &&
        (/Minified React error|Rendered more hooks|Rendered fewer hooks|Content Security Policy|ErrorBoundary caught/i.test(text))
      ) {
        throw new Error(`Error de consola del navegador: ${text}`);
      }
    });
    page.on('pageerror', (error) => {
      throw error;
    });
  });

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

  test('páginas principales no muestran pantalla blanca', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(email as string);
    await page.getByLabel('Contraseña').fill(password as string);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/calendario/);

    const routes = [
      '/calendario',
      '/mapa',
      '/historial',
      '/perfil',
      '/personas-ayudadas',
      '/admin/usuarios',
      '/admin/rutas',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page.getByText('Algo salió mal')).toHaveCount(0);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
