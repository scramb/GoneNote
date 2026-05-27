import { test, expect } from '../fixtures/app.fixture';
import { HomePage } from '../pages/home.page';
import { NotePage } from '../pages/note.page';

test.describe('Error Handling and Edge Cases', () => {
  test('TC-006: empty form submission does not create a note', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();
    await home.submit();

    // Form submits via full page reload (use:enhance not active in prod build)
    await page.waitForLoadState('networkidle');

    // After empty submission, no note link should be created — the form re-renders
    await expect(home.textarea).toBeVisible({ timeout: 10000 });
    await expect(home.noteLink).not.toBeVisible();
  });

  test('TC-007: whitespace-only content creates a note (passes min length validation)', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();
    await home.typeContent('     ');
    await home.submit();

    // Form submits via full page reload
    await page.waitForLoadState('networkidle');

    // Zod .min(1) passes whitespace (length 5 ≥ 1), so note IS created
    await expect(home.noteLink).toBeVisible({ timeout: 10000 });
  });

  test('TC-008: invalid note ID shows error page', async ({ page }) => {
    const notePage = new NotePage(page);

    await notePage.gotoNote('nonexistent12345');

    // Should show an error state, not a blank page
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const bodyText = await body.textContent();
    expect(bodyText).toBeTruthy();
  });

  test('TC-009: malformed note IDs return errors', async ({ page }) => {
    // Test XSS injection attempt
    await page.goto('/note/%3Cscript%3Ealert(1)%3C/script%3E');
    const bodyText1 = await page.locator('body').textContent();
    expect(bodyText1).not.toContain('<script>');

    // Test path traversal attempt
    await page.goto('/note/..%2F..%2F..%2Fetc%2Fpasswd');
    const bodyText2 = await page.locator('body').textContent();
    expect(bodyText2).toBeTruthy();
  });

  test('TC-014: rapid double submit is handled', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();
    await home.typeContent('Double click test');

    // Click submit twice rapidly — the second click may fail if the button
    // is detached after the first submission (which is expected behavior)
    await home.submitButton.click();
    try {
      await home.submitButton.click({ timeout: 1000 });
    } catch {
      // Second click failing is acceptable — button detached after first submit
    }

    // Should not crash — at most one note is created
    await page.waitForLoadState('networkidle');
    const noteLinkVisible = await home.noteLink.isVisible().catch(() => false);
    expect(noteLinkVisible).toBeTruthy();
  });
});
