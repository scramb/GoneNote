import type { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly textarea: Locator;
  readonly ttlSelector: Locator;
  readonly submitButton: Locator;
  readonly noteLink: Locator;
  readonly copyButton: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = page.locator('[data-testid="note-content"]');
    this.ttlSelector = page.locator('[data-testid="ttl-selector"]');
    this.submitButton = page.locator('[data-testid="submit-note"]');
    this.noteLink = page.locator('[data-testid="note-link"]');
    this.copyButton = page.locator('[data-testid="copy-button"]');
    this.validationError = page.locator('[data-testid="validation-error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async typeContent(text: string): Promise<void> {
    await this.textarea.fill(text);
  }

  async selectTTL(value: string): Promise<void> {
    const label = this.ttlSelector.locator('label').filter({ has: this.page.locator(`input[value="${value}"]`) });
    await label.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async createNote(content: string, ttl: string = '604800'): Promise<void> {
    await this.goto();
    await this.typeContent(content);
    await this.selectTTL(ttl);
    await this.submit();
  }

  async getNoteUrl(): Promise<string> {
    return this.noteLink.inputValue();
  }
}
