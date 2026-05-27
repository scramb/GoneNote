import type { Page, Locator } from '@playwright/test';

export class NotePage {
  readonly page: Page;
  readonly noteContent: Locator;
  readonly destroyedState: Locator;
  readonly errorState: Locator;
  readonly lockIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.noteContent = page.locator('[data-testid="note-content"]');
    this.destroyedState = page.locator('[data-testid="note-destroyed"]');
    this.errorState = page.locator('[data-testid="error-state"]');
    this.lockIcon = page.locator('[data-testid="lock-icon"]');
  }

  async gotoNote(id: string): Promise<void> {
    await this.page.goto(`/note/${id}`);
  }

  async getContent(): Promise<string> {
    return this.noteContent.textContent() ?? '';
  }
}
