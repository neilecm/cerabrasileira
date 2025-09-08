import { test, expect } from '@playwright/test';

// Tests checkout flow using Midtrans sandbox
// Mocks Midtrans network to simulate success and failure cases

test.describe('checkout', () => {
  test('completes order successfully', async ({ page }) => {
    await page.route('https://app.sandbox.midtrans.com/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/store/carts/*/complete', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'order',
          order: { id: 'order_test', shipping_address: { country_code: 'us' } },
        }),
      });
    });

    await page.goto('/us/checkout?step=review');
    await page.getByTestId('submit-order-button').click();
    await expect(page).toHaveURL(/\/us\/order\/order_test\/confirmed$/);
  });

  test('shows error when Midtrans fails', async ({ page }) => {
    await page.route('https://app.sandbox.midtrans.com/**', (route) => {
      route.abort();
    });
    await page.route('**/store/carts/*/complete', (route) => {
      route.fulfill({ status: 500, body: 'fail' });
    });

    await page.goto('/us/checkout?step=review');
    await page.getByTestId('submit-order-button').click();
    await expect(page.getByTestId('manual-payment-error-message')).toBeVisible();
  });
});
