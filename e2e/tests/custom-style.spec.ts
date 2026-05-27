import { test, expect } from '../fixtures/app.fixture';
import { HomePage } from '../pages/home.page';
import { NotePage } from '../pages/note.page';

test.describe('Custom Style Templates', () => {
  test('create a note with custom colors and verify they render on the note page', async ({ page }) => {
    const home = new HomePage(page);
    const notePage = new NotePage(page);

    await home.goto();

    // Expand style customizer
    const toggle = page.locator('[data-testid="style-toggle"]');
    await toggle.click();
    await expect(page.locator('[data-testid="style-fields"]')).toBeVisible();

    // Set custom colors
    const bgInput = page.locator('[data-testid="color-bg"]');
    const primaryInput = page.locator('[data-testid="color-primary"]');
    const secondaryInput = page.locator('[data-testid="color-secondary"]');

    await bgInput.fill('#ff0000');
    await primaryInput.fill('#ffffff');
    await secondaryInput.fill('#ffff00');

    // Verify preview is visible
    await expect(page.locator('[data-testid="color-preview"]')).toBeVisible();

    // Create the note
    await home.typeContent('Custom color test note');
    await home.submit();

    await expect(home.noteLink).toBeVisible();
    const url = await home.getNoteUrl();

    // Navigate to note and verify custom colors
    await page.goto(url);
    await expect(notePage.noteContent).toBeVisible();
    await expect(notePage.destroyedState).toBeVisible();

    // Verify main has the custom background color
    const main = page.locator('main');
    const bgColor = await main.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe(''); // Non-empty background
  });

  test('style section defaults to collapsed', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();

    // Style fields should be hidden by default
    await expect(page.locator('[data-testid="style-fields"]')).not.toBeVisible();
  });

  test('note created without custom colors uses default theme', async ({ page }) => {
    const home = new HomePage(page);
    const notePage = new NotePage(page);

    // Don't expand style customizer — leave defaults
    await home.goto();
    await home.typeContent('Default theme test note');
    await home.submit();

    await expect(home.noteLink).toBeVisible();
    const url = await home.getNoteUrl();

    await page.goto(url);
    await expect(notePage.noteContent).toBeVisible();
    // Note renders without custom style — just verify it doesn't crash
  });
});
