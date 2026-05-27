import { test, expect } from '../fixtures/app.fixture';
import { NotePage } from '../pages/note.page';

test.describe('Note Viewing and Self-Destruction', () => {
  test('TC-003: first read shows note content and destruction indicator after reveal', async ({ page, createTestNote }) => {
    const noteId = await createTestNote('Secret message for testing');
    const notePage = new NotePage(page);

    await notePage.gotoNote(noteId);

    // Unrevealed state — waiting message visible, no content
    await expect(notePage.noteWaiting).toBeVisible();
    await expect(notePage.revealButton).toBeVisible();

    // Click reveal
    await notePage.reveal();

    // Revealed state — content + destroyed indicator
    await expect(notePage.noteContent).toBeVisible();
    const content = await notePage.getContent();
    expect(content).toBe('Secret message for testing');
    await expect(notePage.destroyedState).toBeVisible();
    await expect(notePage.lockIcon).toBeVisible();
  });

  test('TC-004: second read shows note is gone', async ({ page, createTestNote }) => {
    const notePage = new NotePage(page);
    const noteId = await createTestNote('One-time read note');

    // First visit — reveal and consume
    await notePage.gotoNote(noteId);
    await notePage.reveal();
    await expect(notePage.noteContent).toBeVisible();

    // Second visit — note already consumed
    await notePage.gotoNote(noteId);
    await expect(notePage.errorState).toBeVisible();
    await expect(notePage.noteContent).not.toBeVisible();
  });

  test('TC-005: expired note shows not found on page load', async ({ page, createTestNote }) => {
    const notePage = new NotePage(page);
    const noteId = await createTestNote('Expiring soon', 2);

    // Wait for TTL to expire
    await page.waitForTimeout(3000);

    await notePage.gotoNote(noteId);
    // Expired — error shown, no waiting message
    await expect(notePage.errorState).toBeVisible();
    await expect(notePage.noteContent).not.toBeVisible();
  });

  test('TC-016: curl-style GET does not consume the note', async ({ page, createTestNote }) => {
    const noteId = await createTestNote('Preview-safe test note');
    const notePage = new NotePage(page);

    // Simulate preview bot: first load without revealing
    await notePage.gotoNote(noteId);
    await expect(notePage.noteWaiting).toBeVisible();
    await expect(notePage.revealButton).toBeVisible();

    // Navigate away and back — note still exists
    await page.goto('/');
    await notePage.gotoNote(noteId);
    await expect(notePage.noteWaiting).toBeVisible();

    // Reveal and verify content
    await notePage.reveal();
    await expect(notePage.noteContent).toBeVisible();
  });
});
