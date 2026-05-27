import { test, expect } from '../fixtures/app.fixture';
import { HomePage } from '../pages/home.page';

test.describe('Cross-Browser Smoke Test', () => {
  test('TC-015: core creation flow works end-to-end', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();

    // Verify key elements are visible
    await expect(home.textarea).toBeVisible();
    await expect(home.ttlSelector).toBeVisible();
    await expect(home.submitButton).toBeVisible();

    // Complete the creation flow
    await home.typeContent('Cross-browser smoke test content');
    await home.selectTTL('3600');
    await home.submit();

    // Verify link is generated
    await expect(home.noteLink).toBeVisible();
    const url = await home.getNoteUrl();
    expect(url).toContain('/note/');
  });
});
