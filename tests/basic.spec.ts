import { test, expect } from '@playwright/test';

test.describe('Claude Agent Template', () => {
  test('should display example prompts', async ({ page }) => {
    await page.goto('/');

    // Check if example prompts are visible
    await expect(page.getByText('Try these examples')).toBeVisible();
    await expect(page.getByText('Hello World Tool')).toBeVisible();
    await expect(page.getByText('File Operations')).toBeVisible();
    await expect(page.getByText('Code Search')).toBeVisible();
    await expect(page.getByText('Agent Capabilities')).toBeVisible();
  });

  test('should have a functioning input field', async ({ page }) => {
    await page.goto('/');

    // Find the textarea input
    const input = page.getByRole('textbox');
    await expect(input).toBeVisible();

    // Type in the input
    await input.fill('Hello, world!');
    await expect(input).toHaveValue('Hello, world!');
  });
});
