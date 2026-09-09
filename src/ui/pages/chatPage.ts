import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para interfaces de chat com LLM.
 * Configurado para o claude.ai — adapte os seletores para outros chats de IA.
 *
 * Como adaptar para outro chat:
 *   1. Inspecione o HTML do chat alvo (F12 → Elements)
 *   2. Substitua os seletores abaixo pelos da aplicação
 *   3. Os métodos e asserções permanecem os mesmos
 */
export class ChatPage {
  readonly page:               Page;
  readonly promptInput:        Locator;
  readonly submitButton:       Locator;
  readonly lastResponse:       Locator;
  readonly allResponses:       Locator;
  readonly streamingIndicator: Locator;
  readonly codeBlock:          Locator;
  readonly newChatButton:      Locator;
  readonly errorBanner:        Locator;
  readonly copyButton:         Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Seletores — ajuste conforme a aplicação alvo ──────────────────────────
    this.promptInput        = page.locator('[data-testid="chat-input"], textarea[placeholder*="message"], div[contenteditable="true"]').first();
    this.submitButton       = page.locator('[data-testid="send-button"], button[aria-label*="Send"], button[type="submit"]').first();
    this.lastResponse       = page.locator('.chat-message-assistant, [data-testid="assistant-message"]').last();
    this.allResponses       = page.locator('.chat-message-assistant, [data-testid="assistant-message"]');
    this.streamingIndicator = page.locator('.typing-indicator, [data-testid="streaming"], .loading-dots');
    this.codeBlock          = page.locator('.chat-message-assistant pre code, [data-testid="code-block"]');
    this.newChatButton      = page.locator('[data-testid="new-chat"], button:has-text("New chat")').first();
    this.errorBanner        = page.locator('[data-testid="error-banner"], .error-message');
    this.copyButton         = page.locator('button[aria-label*="Copy"], button:has-text("Copy")').first();
  }

  // ── Navegação ────────────────────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async startNewChat() {
    await this.newChatButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Interações ───────────────────────────────────────────────────────────────
  async sendPrompt(prompt: string) {
    await this.promptInput.waitFor({ state: 'visible' });
    await this.promptInput.fill(prompt);
    await this.submitButton.click();
  }

  async sendPromptWithKeyboard(prompt: string) {
    await this.promptInput.fill(prompt);
    await this.promptInput.press('Enter');
  }

  async waitForResponseComplete(timeout = 30_000) {
    // Aguarda o streaming terminar (indicador some OU nova mensagem aparece)
    try {
      await expect(this.streamingIndicator).toBeHidden({ timeout });
    } catch {
      // Fallback: aguarda a última resposta parar de crescer
      await this.page.waitForFunction(() => {
        const els = document.querySelectorAll('.chat-message-assistant, [data-testid="assistant-message"]');
        if (els.length === 0) return false;
        const last = els[els.length - 1];
        return last.textContent && last.textContent.length > 5;
      }, { timeout });
    }
  }

  async getLastResponseText(): Promise<string> {
    return (await this.lastResponse.innerText()).trim();
  }

  async getResponseCount(): Promise<number> {
    return this.allResponses.count();
  }

  // ── Asserções UI ──────────────────────────────────────────────────────────────
  async assertResponseVisible() {
    await expect(this.lastResponse).toBeVisible();
  }

  async assertCodeBlockVisible() {
    await expect(this.codeBlock).toBeVisible();
  }

  async assertNoErrorBanner() {
    await expect(this.errorBanner).toBeHidden();
  }

  async assertResponseContains(text: string) {
    const content = await this.getLastResponseText();
    expect(content.toLowerCase()).toContain(text.toLowerCase());
  }

  async assertPageTitle(title: string) {
    await expect(this.page).toHaveTitle(new RegExp(title, 'i'));
  }

  // ── Screenshot & Evidências ───────────────────────────────────────────────────
  async takeEvidenceScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/evidence-${name}.png`, fullPage: true });
  }
}
