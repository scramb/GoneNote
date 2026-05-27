import { test, expect } from '../fixtures/app.fixture';
import { HomePage } from '../pages/home.page';

test.describe('Note Creation', () => {
  test('TC-001: create a note with valid content and receive a shareable link', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();
    await home.typeContent('Hello, this is a test note');
    await home.selectTTL('3600');
    await home.submit();

    await expect(home.noteLink).toBeVisible();
    const url = await home.getNoteUrl();
    expect(url).toContain('/note/');
    expect(url).not.toBe('');
    await expect(home.validationError).not.toBeVisible();
  });

  test('TC-002: click the generated link and reveal the note', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();
    await home.typeContent('Clickable test note');
    await home.selectTTL('604800');
    await home.submit();

    await expect(home.noteLink).toBeVisible();
    const url = await home.getNoteUrl();

    await page.goto(url);
    // Click reveal to actually read the note
    await page.getByRole('button', { name: 'Reveal Note' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="note-content"]')).toBeVisible({ timeout: 10000 });
  });
});
