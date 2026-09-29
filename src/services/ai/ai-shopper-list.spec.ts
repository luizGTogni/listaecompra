import { ShopperList } from '@/domain/shopper-list.entity.js'
import { User } from '@/domain/user.entity.js'
import { MockAiDriver } from '@/drivers/ai/mock-ai.driver.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { InMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { InMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { InMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { ApplyShopperListAiProposalService } from './apply-shopper-list-ai-proposal.service.js'
import { ChatShopperListAiService } from './chat-shopper-list-ai.service.js'

let userRepository: InMemoryUserRepository
let shopperItemRepository: InMemoryShopperItemRepository
let shopperListRepository: InMemoryShopperListRepository
let ai: MockAiDriver
let chat: ChatShopperListAiService
let apply: ApplyShopperListAiProposalService
let owner: User
let guest: User
let shopperList: ShopperList

const ask = (shopperListId?: string, userId = owner.id) =>
  chat.execute({
    userId,
    shopperListId,
    messages: [{ role: 'user', content: 'quero fazer um bolo de cenoura' }]
  })

describe('AI shopper list', () => {
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    shopperItemRepository = new InMemoryShopperItemRepository()
    shopperListRepository = new InMemoryShopperListRepository(
      userRepository,
      shopperItemRepository
    )
    const getUserFound = new GetUserFoundService(userRepository)
    const getShopperListAccess = new GetShopperListAccessService(
      shopperListRepository,
      new InMemoryShopperListMemberRepository()
    )
    ai = new MockAiDriver()
    chat = new ChatShopperListAiService(
      getUserFound,
      getShopperListAccess,
      shopperListRepository,
      ai
    )
    apply = new ApplyShopperListAiProposalService(
      getUserFound,
      getShopperListAccess,
      shopperListRepository,
      shopperItemRepository
    )

    owner = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hash'
    })
    guest = await userRepository.create({
      name: 'Maria',
      username: 'maria',
      email: 'maria@example.com',
      passwordHash: 'hash'
    })
    shopperList = await shopperListRepository.create({
      userId: owner.id,
      title: 'Compras',
      description: ''
    })
  })

  describe('chat', () => {
    it('proposes a new list without applying anything', async () => {
      const { reply, proposal } = await ask()

      expect(reply).toBe('Pensei nestes itens para você:')
      expect(proposal).toEqual({
        title: 'Bolo de cenoura',
        description: undefined,
        addItems: [
          { title: 'Cenoura', quantity: 3, unit: 'UNIT' },
          { title: 'Ovos', quantity: 4, unit: 'UNIT' }
        ],
        removeItems: []
      })
      expect(ai.lastCall?.system).toContain('português do Brasil')
      expect(
        await shopperItemRepository.findAllByShopperListId(shopperList.id)
      ).toHaveLength(0)
    })

    it('cleans the model answer: integer quantities, no duplicates', async () => {
      ai.reply = JSON.stringify({
        reply: 'ok',
        title: 'X',
        addItems: [
          { title: 'Ovos', quantity: 2.6 },
          { title: ' ovos ', quantity: 5 },
          { title: 'Leite', quantity: 0 },
          { title: '  ', quantity: 1 }
        ]
      })

      const { proposal } = await ask()

      expect(proposal?.addItems).toEqual([
        { title: 'Ovos', quantity: 3, unit: 'UNIT' },
        { title: 'Leite', quantity: 1, unit: 'UNIT' }
      ])
    })

    it('clamps items over the limit to it and tells the person', async () => {
      ai.reply = JSON.stringify({
        reply: 'Para a festa:',
        title: 'Festa',
        addItems: [
          { title: 'Cachaça', quantity: 500 },
          { title: 'Cerveja lata 350ml', quantity: 50 },
          { title: 'Gelo', quantity: 51 },
          { title: 'Limão', quantity: 6 }
        ]
      })

      const { reply, proposal } = await ask()

      expect(proposal?.addItems).toEqual([
        { title: 'Cachaça', quantity: 50, unit: 'UNIT' },
        { title: 'Cerveja lata 350ml', quantity: 50, unit: 'UNIT' },
        { title: 'Gelo', quantity: 50, unit: 'UNIT' },
        { title: 'Limão', quantity: 6, unit: 'UNIT' }
      ])
      expect(reply).toContain('Para a festa:')
      expect(reply).toContain('ajustei para o limite')
      expect(reply).toContain('Cachaça (50 UNIT), Gelo (50 UNIT)')
    })

    it('asks the model once to redo the account when it goes over a limit', async () => {
      ai.queue = [
        JSON.stringify({
          reply: 'Primeira tentativa',
          title: 'Festa',
          addItems: [
            { title: 'Cerveja lata 350ml', quantity: 120, unit: 'CAN' },
            { title: 'Limão', quantity: 6 }
          ]
        }),
        JSON.stringify({
          reply: 'Refiz com caixas',
          title: 'Festa',
          addItems: [
            { title: 'Cerveja caixa 12 latas', quantity: 5, unit: 'BOX' },
            { title: 'Limão', quantity: 6 }
          ]
        })
      ]

      const { reply, proposal } = await ask()

      expect(ai.calls).toHaveLength(2)
      expect(ai.calls[1].messages.slice(-2)).toEqual([
        expect.objectContaining({ role: 'assistant' }),
        {
          role: 'user',
          content: expect.stringMatching(
            /Cerveja lata 350ml: 120 CAN, máximo 100.*não mencione limites/
          )
        }
      ])
      expect(reply).toBe('Refiz com caixas')
      expect(proposal?.addItems).toEqual([
        { title: 'Cerveja caixa 12 latas', quantity: 5, unit: 'BOX' },
        { title: 'Limão', quantity: 6, unit: 'UNIT' }
      ])
    })

    it('clamps the first answer when the retry fails or is not JSON', async () => {
      const first = JSON.stringify({
        reply: 'Para a festa:',
        addItems: [{ title: 'Cachaça', quantity: 500, unit: 'BOTTLE' }]
      })

      vi.spyOn(ai, 'chat')
        .mockResolvedValueOnce(first)
        .mockRejectedValueOnce(new Error('rate limited'))

      const failed = await ask()

      expect(failed.proposal?.addItems).toEqual([
        { title: 'Cachaça', quantity: 60, unit: 'BOTTLE' }
      ])

      vi.spyOn(ai, 'chat')
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce('não sei')

      const notJson = await ask()

      expect(notJson.proposal?.addItems).toEqual([
        { title: 'Cachaça', quantity: 60, unit: 'BOTTLE' }
      ])
      expect(notJson.reply).toContain('ajustei para o limite')
    })

    it('accepts null in the optional fields and shows only the question', async () => {
      ai.reply = JSON.stringify({
        reply: 'Quantas pessoas vão à festa e por quanto tempo?',
        title: null,
        description: null,
        addItems: [],
        removeItemIds: []
      })

      expect(await ask()).toEqual({
        reply: 'Quantas pessoas vão à festa e por quanto tempo?',
        proposal: null
      })
      expect(await ask(shopperList.id)).toEqual({
        reply: 'Quantas pessoas vão à festa e por quanto tempo?',
        proposal: null
      })
    })

    it('accepts a null unit and a null reply from the model', async () => {
      ai.reply = JSON.stringify({
        reply: null,
        title: 'Festa',
        addItems: [{ title: 'Limão', quantity: 6, unit: null }]
      })

      const { reply, proposal } = await ask()

      expect(reply).toBe('Pronto! Veja a sugestão abaixo.')
      expect(proposal?.addItems).toEqual([
        { title: 'Limão', quantity: 6, unit: 'UNIT' }
      ])
    })

    it('asks once for the JSON when the model answers with reasoning only', async () => {
      const reasoning =
        'Cálculo: 50 pessoas × 2,5 latas = 125 latas → limite de 50. '.repeat(
          20
        )

      ai.queue = [
        reasoning,
        JSON.stringify({
          reply: 'Pronto!',
          title: 'Festa',
          addItems: [{ title: 'Cerveja caixa', quantity: 10, unit: 'BOX' }]
        })
      ]

      const { reply, proposal } = await ask()

      expect(ai.calls).toHaveLength(2)
      expect(ai.calls[1].messages.at(-1)?.content).toContain('SOMENTE')
      expect(reply).toBe('Pronto!')
      expect(proposal?.addItems).toEqual([
        { title: 'Cerveja caixa', quantity: 10, unit: 'BOX' }
      ])
    })

    it('does not show long text without JSON, only a short message', async () => {
      const reasoning = 'Cálculo: 125 latas → dividir em 3 itens. '.repeat(30)
      ai.reply = reasoning

      const { reply, proposal } = await ask()

      expect(ai.calls).toHaveLength(2)
      expect(reply).toBe(
        'Não consegui montar a resposta agora. Tente descrever de outro jeito ou com menos detalhes.'
      )
      expect(reply).not.toContain('Cálculo')
      expect(proposal).toBeNull()
    })

    it('tells the model to go up to bigger packs and how to size a party', async () => {
      await ask()

      const system = ai.lastCall?.system

      expect(system).toContain('nunca arredonde a quantidade')
      expect(system).toContain('passar de 24 latas ou garrafas')
      expect(system).toContain('BOX (caixa ou fardo de 12 ou 24)')
      expect(system).toContain('70% dos convidados')
      expect(system).toContain('Gelo')
    })

    it('tells the model not to write reasoning nor split a product', async () => {
      await ask()

      expect(ai.lastCall?.system).toContain('Não escreva contas')
      expect(ai.lastCall?.system).toContain(
        'Nunca divida o mesmo produto em vários itens'
      )
    })

    it('does not call the model twice when nothing is over the limit', async () => {
      await ask()

      expect(ai.calls).toHaveLength(1)
    })

    it('tells the model what quantity means and to ask when context is missing', async () => {
      await ask()

      expect(ai.lastCall?.system).toContain('"unit" é a unidade')
      // The limits stay out of the prompt: the model treats a number it is
      // shown as a target.
      expect(ai.lastCall?.system).not.toMatch(/BOTTLE 60|CAN 100|UNIT 50/)
      expect(ai.lastCall?.system).toContain('pergunte em "reply"')
    })

    it('keeps the unit the model chose, with decimals only in weight and volume', async () => {
      ai.reply = JSON.stringify({
        reply: 'ok',
        title: 'Festa',
        addItems: [
          { title: 'Cachaça 700ml', quantity: 3, unit: 'BOTTLE' },
          { title: 'Picanha', quantity: 2.5, unit: 'kg' },
          { title: 'Leite', quantity: 0.75, unit: 'L' },
          { title: 'Cerveja lata', quantity: 23.6, unit: 'CAN' },
          { title: 'Guardanapo', quantity: 2, unit: 'BARRIL' }
        ]
      })

      const { proposal } = await ask()

      expect(proposal?.addItems).toEqual([
        { title: 'Cachaça 700ml', quantity: 3, unit: 'BOTTLE' },
        { title: 'Picanha', quantity: 2.5, unit: 'KG' },
        { title: 'Leite', quantity: 0.75, unit: 'L' },
        { title: 'Cerveja lata', quantity: 24, unit: 'CAN' },
        { title: 'Guardanapo', quantity: 2, unit: 'UNIT' }
      ])
    })

    it('applies the limit of each unit', async () => {
      ai.reply = JSON.stringify({
        reply: 'Para a festa:',
        title: 'Festa',
        addItems: [
          { title: 'Cachaça', quantity: 500, unit: 'BOTTLE' },
          { title: 'Vodka', quantity: 61, unit: 'BOTTLE' },
          { title: 'Suco', quantity: 2, unit: 'L' },
          { title: 'Carne', quantity: 31, unit: 'KG' },
          { title: 'Farinha', quantity: 5000, unit: 'G' }
        ]
      })

      const { reply, proposal } = await ask()

      expect(proposal?.addItems).toEqual([
        { title: 'Cachaça', quantity: 60, unit: 'BOTTLE' },
        { title: 'Vodka', quantity: 60, unit: 'BOTTLE' },
        { title: 'Suco', quantity: 2, unit: 'L' },
        { title: 'Carne', quantity: 30, unit: 'KG' },
        { title: 'Farinha', quantity: 5000, unit: 'G' }
      ])
      expect(reply).toContain(
        'Cachaça (60 BOTTLE), Vodka (60 BOTTLE), Carne (30 KG)'
      )
    })

    it('tells the model the unit of the current items', async () => {
      await shopperItemRepository.create({
        shopperListId: shopperList.id,
        title: 'Frango',
        description: '',
        quantity: 1.5,
        unit: 'KG'
      })

      await ask(shopperList.id)

      expect(ai.lastCall?.system).toContain('Frango | quantidade 1.5 KG')
    })

    it('drops the odd invalid item but keeps the valid ones', async () => {
      ai.reply = JSON.stringify({
        reply: 'ok',
        addItems: [
          { title: 'Cenoura', quantity: 3 },
          { title: 'Ovos', quantity: 2 },
          { title: '<script>alert(1)</script>', quantity: 1 }
        ]
      })

      const { proposal } = await ask()

      expect(proposal?.addItems).toEqual([
        { title: 'Cenoura', quantity: 3, unit: 'UNIT' },
        { title: 'Ovos', quantity: 2, unit: 'UNIT' }
      ])
    })

    it('refuses the whole answer when most items are not list items', async () => {
      ai.reply = JSON.stringify({
        reply: 'Aqui está o poema',
        title: 'Poema',
        addItems: [
          {
            title: 'Era uma vez um reino muito distante de tudo isso aqui',
            quantity: 1
          },
          { title: 'Rimas\ne versos', quantity: 1 },
          { title: 'Cenoura', quantity: 1 }
        ]
      })

      expect(await ask()).toEqual({
        reply:
          'Não consegui montar essa lista. Tente descrever de outro jeito.',
        proposal: null
      })
    })

    it('reads JSON wrapped in text, and shows plain text with no changes', async () => {
      ai.reply =
        'Claro!\n```json\n{"reply":"Oi","addItems":[{"title":"Pão","quantity":1}]}\n```'
      expect((await ask()).proposal?.addItems).toEqual([
        { title: 'Pão', quantity: 1, unit: 'UNIT' }
      ])

      ai.reply = 'Não entendi o formato'
      expect(await ask()).toEqual({
        reply: 'Não entendi o formato',
        proposal: null
      })
    })

    it('tells the model about the current items and drops repeated ones', async () => {
      const ovos = await shopperItemRepository.create({
        shopperListId: shopperList.id,
        title: 'Ovos',
        description: '',
        quantity: 1
      })
      ai.reply = JSON.stringify({
        reply: 'ok',
        addItems: [
          { title: 'ovos', quantity: 2 },
          { title: 'Leite', quantity: 1 }
        ],
        removeItemIds: [ovos.id, 'not-in-the-list']
      })

      const { proposal } = await ask(shopperList.id)

      expect(ai.lastCall?.system).toContain(`id=${ovos.id}`)
      // "ovos" leaves and comes back in the same proposal, so it is kept.
      expect(proposal?.addItems).toEqual([
        { title: 'ovos', quantity: 2, unit: 'UNIT' },
        { title: 'Leite', quantity: 1, unit: 'UNIT' }
      ])
      expect(proposal?.removeItems).toEqual([{ id: ovos.id, title: 'Ovos' }])
    })

    it('does not propose a rename to a guest, and refuses strangers and closed lists', async () => {
      ai.reply = JSON.stringify({ reply: 'ok', title: 'Outro nome' })

      await expect(ask(shopperList.id, guest.id)).rejects.toBeInstanceOf(
        ResourceNotFoundError
      )

      await shopperListRepository.update({
        ...shopperList,
        closedAt: new Date()
      })
      await expect(ask(shopperList.id)).rejects.toBeInstanceOf(
        ShopperListClosedError
      )
    })
  })

  describe('apply', () => {
    it('creates a list with its items, avoiding a taken title', async () => {
      const first = await apply.execute({
        userId: owner.id,
        title: 'Compras',
        addItems: [
          { title: 'Cenoura', quantity: 3 },
          { title: 'cenoura', quantity: 1 }
        ],
        removeItemIds: []
      })

      const created = await shopperListRepository.findById(first.shopperListId)
      expect(created?.title).toBe('Compras (2)')
      expect(first.added).toBe(1)
    })

    it('ignores items that do not look like list items, even if the client sent them', async () => {
      const result = await apply.execute({
        userId: owner.id,
        shopperListId: shopperList.id,
        addItems: [
          { title: 'Cenoura', quantity: 1 },
          { title: '<script>alert(1)</script>', quantity: 1 }
        ],
        removeItemIds: []
      })

      expect(result.added).toBe(1)
    })

    it('renames, removes and adds on an existing list', async () => {
      const old = await shopperItemRepository.create({
        shopperListId: shopperList.id,
        title: 'Pão',
        description: '',
        quantity: 1
      })

      const result = await apply.execute({
        userId: owner.id,
        shopperListId: shopperList.id,
        title: 'Bolo de cenoura',
        addItems: [{ title: 'Cenoura', quantity: 3 }],
        removeItemIds: [old.id, 'missing']
      })

      expect(result).toMatchObject({ added: 1, removed: 1 })
      expect(
        (await shopperListRepository.findById(shopperList.id))?.title
      ).toBe('Bolo de cenoura')
      const items = await shopperItemRepository.findAllByShopperListId(
        shopperList.id
      )
      expect(items.map((item) => item.title)).toEqual(['Cenoura'])
    })

    it("refuses to change a closed list or someone else's list", async () => {
      await expect(
        apply.execute({
          userId: guest.id,
          shopperListId: shopperList.id,
          addItems: [],
          removeItemIds: []
        })
      ).rejects.toBeInstanceOf(ResourceNotFoundError)

      await shopperListRepository.update({
        ...shopperList,
        closedAt: new Date()
      })
      await expect(
        apply.execute({
          userId: owner.id,
          shopperListId: shopperList.id,
          addItems: [{ title: 'Ovos', quantity: 1 }],
          removeItemIds: []
        })
      ).rejects.toBeInstanceOf(ShopperListClosedError)
    })

    it('creates items with their unit and skips quantities the unit does not allow', async () => {
      const result = await apply.execute({
        userId: owner.id,
        shopperListId: shopperList.id,
        addItems: [
          { title: 'Picanha', quantity: 1.5, unit: 'KG' },
          { title: 'Cachaça', quantity: 2, unit: 'BOTTLE' },
          { title: 'Vodka', quantity: 2.5, unit: 'BOTTLE' },
          { title: 'Whisky', quantity: 500, unit: 'BOTTLE' },
          { title: 'Ovos', quantity: 1 }
        ],
        removeItemIds: []
      })

      const items = await shopperItemRepository.findAllByShopperListId(
        shopperList.id
      )

      expect(result.added).toBe(3)
      expect(
        items.map(({ title, quantity, unit }) => ({ title, quantity, unit }))
      ).toEqual([
        { title: 'Picanha', quantity: 1.5, unit: 'KG' },
        { title: 'Cachaça', quantity: 2, unit: 'BOTTLE' },
        { title: 'Ovos', quantity: 1, unit: 'UNIT' }
      ])
    })
  })
})
