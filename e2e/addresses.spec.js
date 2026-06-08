import { test, expect } from '@playwright/test';

const mockAddresses = [
  {
    id: 1,
    street: 'Main St',
    housenumber: '42',
    addition: '',
    postalcode: '1234AB',
    city: 'Amsterdam',
    country: 'Netherlands',
  },
  {
    id: 2,
    street: 'Elm St',
    housenumber: '7',
    addition: 'B',
    postalcode: '3000BB',
    city: 'Rotterdam',
    country: 'Netherlands',
  },
];

test.beforeEach(async ({ page }) => {
  // Inject a fake Supabase session so ProtectedRoute renders the app instead
  // of redirecting to /login. Overriding localStorage.getItem catches any
  // sb-*-auth-token key regardless of the exact format supabase-js uses.
  await page.addInitScript(() => {
    const fakeSession = JSON.stringify({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: 'mock-user-id', email: 'test@test.com', role: 'authenticated', aud: 'authenticated' },
    });
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) return fakeSession;
      return original.call(this, key);
    };
  });

  await page.route('**/api/address', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({ json: mockAddresses });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { id: 3, ...body } });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/address/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    const id = parseInt(url.split('/').pop(), 10);
    const address = mockAddresses.find((a) => a.id === id) ?? null;

    if (method === 'GET') {
      await route.fulfill({ json: address, status: address ? 200 : 404 });
    } else if (method === 'PUT') {
      const body = route.request().postDataJSON();
      await route.fulfill({ json: { ...address, ...body } });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204, body: '' });
    } else {
      await route.continue();
    }
  });
  page.setDefaultTimeout(3000);

  await page.goto('/');
});

test('shows all addresses on the home page', async ({ page }) => {
  await expect(page.getByText('Main St 42')).toBeVisible();
  await expect(page.getByText('Elm St 7 B')).toBeVisible();
});

test('can search addresses by street', async ({ page }) => {
  await page.getByPlaceholder('Contacten zoeken...').fill('Main');

  await expect(page.getByText('Main St 42')).toBeVisible();
  await expect(page.getByText('Elm St 7 B')).not.toBeVisible();
});

test('clear button resets search and shows all addresses', async ({ page }) => {
  await page.getByPlaceholder('Contacten zoeken...').fill('Main');
  await page.getByLabel('Zoekopdracht wissen').click();

  await expect(page.getByText('Elm St 7 B')).toBeVisible();
});

test('navigates to add form when clicking + Add Address', async ({ page }) => {
  await page.getByRole('link', { name: /\+ Adres toevoegen/i }).click();

  await expect(page).toHaveURL('/add');
  await expect(page.getByRole('heading', { name: 'Adres toevoegen' })).toBeVisible();
});

test('shows validation error when street is whitespace-only', async ({ page }) => {
  // Filling with spaces passes HTML required validation but fails the JS trim check
  await page.getByRole('link', { name: /\+ Adres toevoegen/i }).click();
  await page.getByLabel('Straat *').fill('   ');
  await page.getByLabel('Nummer *').fill('   ');
  await page.getByRole('button', { name: 'Adres toevoegen' }).click();

  await expect(page.getByText('Straat en huisnummer zijn verplicht')).toBeVisible();
});

test('can add a new address and return to home', async ({ page }) => {
  await page.getByRole('link', { name: /\+ Adres toevoegen/i }).click();

  await page.getByLabel('Straat *').fill('New St');
  await page.getByLabel('Nummer *').fill('99');
  await page.getByLabel('Stad').fill('Utrecht');
  await page.getByRole('button', { name: 'Adres toevoegen' }).click();

  await expect(page).toHaveURL('/');
});

test('cancel on add form returns to home without submitting', async ({ page }) => {
  await page.getByRole('link', { name: /\+ Adres toevoegen/i }).click();
  await page.getByRole('button', { name: 'Annuleren' }).click();

  await expect(page).toHaveURL('/');
});

test('clicking an address card navigates to edit form with pre-filled data', async ({ page }) => {
  await page.getByText('Main St 42').click();

  await expect(page).toHaveURL('/edit/1');
  await expect(page.getByRole('heading', { name: 'Adres bewerken' })).toBeVisible();
  await expect(page.getByLabel('Straat *')).toHaveValue('Main St');
  await expect(page.getByLabel('Nummer *')).toHaveValue('42');
});

test('can save edits and return to home', async ({ page }) => {
  await page.getByText('Main St 42').click();
  await expect(page.getByLabel('Straat *')).toHaveValue('Main St');

  await page.getByLabel('Stad').fill('Utrecht');
  await page.getByRole('button', { name: 'Bijwerken' }).click();

  await expect(page).toHaveURL('/');
});

test('can delete an address after confirming the dialog', async ({ page }) => {
  const deleteRequest = page.waitForRequest(
    (req) => req.url().includes('/api/address/') && req.method() === 'DELETE',
  );

  await page.getByLabel('Adres verwijderen').first().click();
  await page.getByRole('button', { name: 'Verwijderen' }).click();
  await deleteRequest;
});

test('does not delete when user dismisses the confirmation dialog', async ({ page }) => {
  let deleteCalled = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/address/') && req.method() === 'DELETE') {
      deleteCalled = true;
    }
  });

  await page.getByLabel('Adres verwijderen').first().click();
  await page.getByRole('button', { name: 'Annuleren' }).click();
  await page.waitForTimeout(300);

  expect(deleteCalled).toBe(false);
});
