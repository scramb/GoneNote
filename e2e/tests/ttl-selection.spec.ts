import { test, expect } from '../fixtures/app.fixture';
import { HomePage } from '../pages/home.page';
import { NotePage } from '../pages/note.page';

test.describe('TTL Selection', () => {
  test('TC-012: TTL options are visible with a default selected', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();

    await expect(home.ttlSelector).toBeVisible();

    // Verify multiple options exist
    const radioInputs = home.ttlSelector.locator('input[type="radio"]');
    const count = await radioInputs.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify one is checked (default)
    let hasChecked = false;
    for (let i = 0; i < count; i++) {
      if (await radioInputs.nth(i).isChecked()) {
        hasChecked = true;
        break;
      }
    }
    expect(hasChecked).toBeTruthy();
  });

  test('TC-013: note with shortest TTL is accessible immediately after creation', async ({ page }) => {
    const home = new HomePage(page);
    const notePage = new NotePage(page);

    await home.goto();
    await home.typeContent('Short TTL test');
    await home.selectTTL('3600');
    await home.submit();

    await expect(home.noteLink).toBeVisible();
    const url = await home.getNoteUrl();

    await page.goto(url);
    await expect(notePage.noteContent).toBeVisible();
    await expect(notePage.destroyedState).toBeVisible();
  });
});
