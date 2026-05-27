import { test, expect } from '../fixtures/app.fixture';
import { NotePage } from '../pages/note.page';

test.describe('Note Viewing and Self-Destruction', () => {
  test('TC-003: first read shows note content and destruction indicator', async ({ page, createTestNote }) => {
    const noteId = await createTestNote('Secret message for testing');
    const notePage = new NotePage(page);

    await notePage.gotoNote(noteId);

    await expect(notePage.noteContent).toBeVisible();
    const content = await notePage.getContent();
    expect(content).toBe('Secret message for testing');
    await expect(notePage.destroyedState).toBeVisible();
    await expect(notePage.lockIcon).toBeVisible();
  });

  test('TC-004: second read shows note is gone', async ({ page, createTestNote }) => {
    const notePage = new NotePage(page);
    const noteId = await createTestNote('One-time read note');

    await notePage.gotoNote(noteId);
    await expect(notePage.noteContent).toBeVisible();

    await notePage.gotoNote(noteId);
    await expect(notePage.errorState).toBeVisible();
    await expect(notePage.noteContent).not.toBeVisible();
  });

  test('TC-005: expired note shows not found', async ({ page, createTestNote }) => {
    const notePage = new NotePage(page);
    const noteId = await createTestNote('Expiring soon', 2);

    // Wait for TTL to expire
    await page.waitForTimeout(3000);

    await notePage.gotoNote(noteId);
    await expect(notePage.errorState).toBeVisible();
    await expect(notePage.noteContent).not.toBeVisible();
  });
});
