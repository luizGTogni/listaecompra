import { AiUnavailableError } from '@/http/types/errors/ai-unavailable.error.js'
import { NvidiaNimAiDriver } from './nvidia-nim-ai.driver.js'

const ok = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }))

const params = {
  system: 's',
  messages: [{ role: 'user' as const, content: 'oi' }]
}

describe('NvidiaNimAiDriver', () => {
  it('sends the conversation with the key and returns the text', async () => {
    const fetcher = vi.fn().mockResolvedValue(ok(' resposta '))
    const sut = new NvidiaNimAiDriver(['key-1'], 'model-x', fetcher)

    expect(await sut.chat(params)).toBe('resposta')

    const [, init] = fetcher.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer key-1')
    const body = JSON.parse(init.body)
    expect(body.model).toBe('model-x')
    expect(body.chat_template_kwargs).toEqual({ enable_thinking: false })
    expect(body.messages[0]).toEqual({ role: 'system', content: 's' })
    expect(body.messages[1]).toEqual({ role: 'user', content: 'oi' })
  })

  it('falls back to the second key when the first is rate limited', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 429 }))
      .mockResolvedValueOnce(ok('do segundo'))
    const sut = new NvidiaNimAiDriver(['key-1', 'key-2'], 'm', fetcher)

    expect(await sut.chat(params)).toBe('do segundo')
    expect(fetcher.mock.calls[1][1].headers.Authorization).toBe('Bearer key-2')
  })

  it('throws AiUnavailable when every key fails or there are none', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('network'))

    await expect(
      new NvidiaNimAiDriver(['a', 'b'], 'm', failing).chat(params)
    ).rejects.toBeInstanceOf(AiUnavailableError)
    await expect(
      new NvidiaNimAiDriver([], 'm', failing).chat(params)
    ).rejects.toBeInstanceOf(AiUnavailableError)
  })
})
