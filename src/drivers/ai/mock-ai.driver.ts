import { AiChatParams, AiDriver } from './ai.driver.js'

// Used in tests: answers what `reply` is set to, and records the last call.
export class MockAiDriver implements AiDriver {
  public lastCall: AiChatParams | null = null

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

    return this.reply
  }
}
