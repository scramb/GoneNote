import type { Page, Locator } from '@playwright/test';

export class NotePage {
  readonly page: Page;
  readonly noteContent: Locator;
  readonly destroyedState: Locator;
  readonly errorState: Locator;
  readonly lockIcon: Locator;
  readonly noteWaiting: Locator;
  readonly revealButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.noteContent = page.locator('[data-testid="note-content"]');
    this.destroyedState = page.locator('[data-testid="note-destroyed"]');
    this.errorState = page.locator('[data-testid="error-state"]');
    this.lockIcon = page.locator('[data-testid="lock-icon"]');
    this.noteWaiting = page.locator('[data-testid="note-waiting"]');
    this.revealButton = page.getByRole('button', { name: 'Reveal Note' });
  }

  async gotoNote(id: string): Promise<void> {
    await this.page.goto(`/note/${id}`);
  }

  async getContent(): Promise<string> {
    return this.noteContent.textContent() ?? '';
  }

  async reveal(): Promise<void> {
    await this.revealButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
