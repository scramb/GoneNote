import { test, expect } from '../fixtures/app.fixture';
import { NotePage } from '../pages/note.page';

test.describe('API Create Note', () => {
  test('create a note via API and verify the URL works', async ({ page, request: apiRequest }) => {
    const baseURL = 'http://localhost:3000';
    const notePage = new NotePage(page);

    // Create note via API
    const response = await apiRequest.post(`${baseURL}/api/note`, {
      data: { secret: 'API-created test note', ttl: '3600' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.noteUrl).toMatch(/^\/note\//);

    // Verify the note URL works
    await page.goto(body.noteUrl);
    await expect(notePage.noteWaiting).toBeVisible();
    await notePage.reveal();
    await expect(notePage.noteContent).toBeVisible();
    const content = await notePage.getContent();
    expect(content).toBe('API-created test note');
  });

  test('API returns 400 for empty secret', async ({ request: apiRequest }) => {
    const response = await apiRequest.post('http://localhost:3000/api/note', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);
  });
});
