import { AiChatParams, AiDriver } from './ai.driver.js'

// Used in tests: answers what `reply` is set to, and records the last call.
export class MockAiDriver implements AiDriver {
  public lastCall: AiChatParams | null = null
  public calls: AiChatParams[] = []
  // Answers to give before falling back to `reply`, one per call.
  public queue: string[] = []

  constructor(
    public reply = JSON.stringify({
      reply: 'Pensei nestes itens para você:',
      title: 'Bolo de cenoura',
      description: '',
      addItems: [
        { title: 'Cenoura', quantity: 3 },
        { title: 'Ovos', quantity: 4 }
      ],
      removeItemIds: []
    })
  ) {}

  async chat(params: AiChatParams) {
    this.lastCall = params
    this.calls.push(params)

    return this.queue.shift() ?? this.reply
  }
}
