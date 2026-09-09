import { APIRequestContext, APIResponse } from '@playwright/test';

export interface LlmMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LlmResponseBody {
  id: string;
  object: string;
  model: string;
  choices: Array<{
    index: number;
    message: LlmMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Cliente HTTP para endpoints de LLM compatíveis com a spec OpenAI.
 * Funciona com OpenAI, OpenRouter, Anthropic (via proxy), Together.ai, etc.
 */
export class LlmApiClient {
  private baseUrl: string;
  private apiKey: string;
  private defaultModel: string;

  constructor(
    private request: APIRequestContext,
    options?: { baseUrl?: string; apiKey?: string; model?: string }
  ) {
    this.baseUrl      = options?.baseUrl  ?? process.env.LLM_BASE_URL ?? 'https://api.openai.com';
    this.apiKey       = options?.apiKey   ?? process.env.LLM_API_KEY  ?? 'mock-key';
    this.defaultModel = options?.model    ?? process.env.LLM_MODEL    ?? 'gpt-4o-mini';
  }

  /**
   * Envia um prompt simples e retorna a APIResponse bruta.
   */
  async sendPrompt(prompt: string, opts: LlmRequestOptions = {}): Promise<APIResponse> {
    const messages: LlmMessage[] = [];

    if (opts.systemPrompt) {
      messages.push({ role: 'system', content: opts.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    return this.request.post(`${this.baseUrl}/v1/chat/completions`, {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      data: {
        model:       opts.model       ?? this.defaultModel,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens:  opts.maxTokens   ?? 500,
      },
      timeout: Number(process.env.LLM_RESPONSE_TIMEOUT) || 30_000,
    });
  }

  /**
   * Envia múltiplas mensagens (conversa multi-turn).
   */
  async sendConversation(messages: LlmMessage[], opts: LlmRequestOptions = {}): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/v1/chat/completions`, {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      data: {
        model:       opts.model       ?? this.defaultModel,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens:  opts.maxTokens   ?? 1000,
      },
      timeout: Number(process.env.LLM_RESPONSE_TIMEOUT) || 30_000,
    });
  }

  /**
   * Extrai o texto da resposta a partir do body JSON.
   */
  static extractContent(body: LlmResponseBody): string {
    return body.choices?.[0]?.message?.content?.trim() ?? '';
  }
}
