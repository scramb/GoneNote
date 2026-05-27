import { test, expect } from '../fixtures/app.fixture';
import { HomePage } from '../pages/home.page';

test.describe('Copy Link to Clipboard', () => {
  test('TC-010: copy button copies the correct URL to clipboard', async ({ page, context }) => {
    // clipboard-read/write permissions are Chromium-only
    const isChromium = test.info().project.name === 'chromium';
    if (isChromium) {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }

    const home = new HomePage(page);
    await home.createNote('Copy test note');

    await expect(home.noteLink).toBeVisible();
    const noteUrl = await home.getNoteUrl();

    await home.copyButton.click();

    // Verify clipboard content (Chromium only)
    if (isChromium) {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain(noteUrl);
    }
    // All browsers: button is still visible after click
    await expect(home.copyButton).toBeVisible();
  });

  test('TC-011: copy button responds to click', async ({ page, context }) => {
    const isChromium = test.info().project.name === 'chromium';
    if (isChromium) {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }

    const home = new HomePage(page);
    await home.createNote('Visual feedback test');

    await expect(home.noteLink).toBeVisible();

    await home.copyButton.click();

    // Chromium: verify visual feedback shows "Copied!"
    if (isChromium) {
      await expect(home.copyButton).toContainText(/copied/i);
    }
    // All browsers: button still exists (no crash on click)
    await expect(home.copyButton).toBeVisible();
  });
});
