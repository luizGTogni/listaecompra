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
          { title: 'Cenoura', quantity: 3 },
          { title: 'Ovos', quantity: 4 }
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
          { title: 'Sal', quantity: 100000 },
          { title: '  ', quantity: 1 }
        ]
      })

      const { proposal } = await ask()

      expect(proposal?.addItems).toEqual([
        { title: 'Ovos', quantity: 3 },
        { title: 'Leite', quantity: 1 },
        { title: 'Sal', quantity: 999 }
      ])
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
        { title: 'Cenoura', quantity: 3 },
        { title: 'Ovos', quantity: 2 }
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
        { title: 'Pão', quantity: 1 }
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
        { title: 'ovos', quantity: 2 },
        { title: 'Leite', quantity: 1 }
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
  })
})
