import { env } from '@/config/env.js'
import { logger } from '@/config/logger.js'
import { AiUnavailableError } from '@/http/types/errors/ai-unavailable.error.js'
import { AiChatParams, AiDriver } from './ai.driver.js'

const TIMEOUT_MS = 30_000

interface NimResponse {
  choices?: { message?: { content?: string } }[]
}

// NVIDIA NIM speaks the OpenAI chat-completions protocol. Keys are tried in
// order, so a rate-limited or failing first key falls back to the second.
export class NvidiaNimAiDriver implements AiDriver {
  constructor(
    private keys: string[] = [
      env.NVIDIA_NIM_API_KEY_1,
      env.NVIDIA_NIM_API_KEY_2
    ].filter((key): key is string => !!key),
    private model = env.NVIDIA_NIM_MODEL,
    private fetcher: typeof fetch = fetch
  ) {}

  async chat({ system, messages }: AiChatParams) {
    for (const [index, key] of this.keys.entries()) {
      const text = await this.tryKey(key, index + 1, system, messages)

      if (text) {
        return text
      }
    }

    throw new AiUnavailableError()
  }

  private async tryKey(
    key: string,
    keyNumber: number,
    system: string,
    messages: AiChatParams['messages']
  ) {
    try {
      const response = await this.fetcher(env.NVIDIA_NIM_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'system', content: system }, ...messages],
          temperature: 0.3,
          max_tokens: 2048,
          stream: false,
          // Reasoning models (Nemotron) spend the whole token budget thinking
          // and get cut before the JSON. Other models ignore this.
          chat_template_kwargs: { enable_thinking: false }
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS)
      })

      if (!response.ok) {
        // The reason (dead model, bad key, rate limit) would otherwise be lost
        // behind the generic "unavailable" answer. The key is never logged.
        logger.warn(
          {
            keyNumber,
            model: this.model,
            status: response.status,
            detail: (await response.text().catch(() => '')).slice(0, 300)
          },
          'NVIDIA NIM request failed'
        )

        return null
      }

      const data = (await response.json()) as NimResponse

      return data.choices?.[0]?.message?.content?.trim() || null
    } catch (error) {
      logger.warn(
        { keyNumber, model: this.model, err: error },
        'NVIDIA NIM request errored'
      )

      return null
    }
  }
}
