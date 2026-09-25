import { AiDriver, AiMessage } from '@/drivers/ai/ai.driver.js'
import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { z } from 'zod'
import { guardItems } from './ai-output-guard.js'

export const AI_TITLE_MAX = 60
export const AI_DESCRIPTION_MAX = 200
export const AI_ITEM_MAX_QUANTITY = 999
const MAX_ADD_ITEMS = 40

interface ChatShopperListAiRequest {
  userId: string
  // Without it the chat is about a list that does not exist yet.
  shopperListId?: string
  messages: AiMessage[]
}

export interface AiProposal {
  title?: string
  description?: string
  addItems: { title: string; quantity: number }[]
  removeItems: { id: string; title: string }[]
}

interface ChatShopperListAiResponse {
  reply: string
  proposal: AiProposal | null
}

// What the model is asked to answer, before it is cleaned up.
const modelAnswerSchema = z.object({
  reply: z.string().default(''),
  title: z.string().optional(),
  description: z.string().optional(),
  addItems: z
    .array(z.object({ title: z.string(), quantity: z.coerce.number() }))
    .default([]),
  removeItemIds: z.array(z.string()).default([])
})

const FORMAT_RULES = `Responda SEMPRE em português do Brasil e SOMENTE com um objeto JSON, sem texto fora dele e sem markdown, neste formato:
{"reply": "mensagem curta e amigável para a pessoa", "title": "novo nome da lista (omita se não for mudar)", "description": "nova descrição (omita se não for mudar)", "addItems": [{"title": "Cenoura", "quantity": 3}], "removeItemIds": []}
Regras:
- "quantity" é sempre um número inteiro maior ou igual a 1.
- Títulos de itens são curtos, no singular ou plural natural de mercado (ex.: "Ovos", "Farinha de trigo"), sem quantidade no texto.
- Não inclua itens que já estão na lista.
- Se a pessoa só conversar ou perguntar algo, responda em "reply" e deixe "addItems" e "removeItemIds" vazios.`

function normalize(text: string) {
  return text.trim().toLowerCase()
}

export class ChatShopperListAiService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperListRepository: ShopperListRepository,
    private aiDriver: AiDriver
  ) {}

  async execute(
    data: ChatShopperListAiRequest
  ): Promise<ChatShopperListAiResponse> {
    await this.getUserFound.execute({ userId: data.userId })

    let items: ShopperItem[] = []
    let canRename = true
    let currentTitle: string | null = null
    let system: string

    if (data.shopperListId) {
      const access = await this.getShopperListAccess.execute({
        shopperListId: data.shopperListId,
        userId: data.userId
      })

      if (access.closedAt) {
        throw new ShopperListClosedError()
      }

      const shopperList =
        await this.shopperListRepository.findWithItemsAndUserById(
          data.shopperListId
        )

      if (!shopperList) {
        throw new ResourceNotFoundError()
      }

      items = shopperList.shopperItems
      canRename = shopperList.userId === data.userId
      currentTitle = shopperList.title

      const current = items.length
        ? items
            .map(
              (item) =>
                `- id=${item.id} | ${item.title} | quantidade ${item.quantity}`
            )
            .join('\n')
        : '(a lista está vazia)'

      system = `Você é o assistente do app Lista&Compra e ajuda a editar uma lista de compras existente: sugerir itens, remover itens, ${
        canRename ? 'mudar o nome da lista ou refazê-la' : 'ou refazer os itens'
      }.
Lista atual: "${shopperList.title}"
Itens atuais:
${current}

Para refazer a lista, coloque em "removeItemIds" os ids dos itens que saem e em "addItems" os novos. Só use ids da lista acima.${
        canRename ? '' : ' Você NÃO pode mudar o nome nem a descrição.'
      }
${FORMAT_RULES}`
    } else {
      system = `Você é o assistente do app Lista&Compra e cria listas de compras novas a partir da descrição da pessoa (uma receita, um evento, a semana). Sempre inclua "title" com um nome curto para a lista e os itens necessários em "addItems", com quantidades realistas. "removeItemIds" fica sempre vazio.
${FORMAT_RULES}`
    }

    const raw = await this.aiDriver.chat({
      system,
      messages: data.messages
    })

    const answer = this.parse(raw)

    if (!answer) {
      // The model ignored the format: still show what it said, with no changes.
      return { reply: raw.slice(0, 800), proposal: null }
    }

    const existingTitles = new Set(items.map((item) => normalize(item.title)))
    const removedIds = new Set(
      answer.removeItemIds.filter((id) => items.some((item) => item.id === id))
    )
    const removeItems = items
      .filter((item) => removedIds.has(item.id))
      .map((item) => ({ id: item.id, title: item.title }))
    // Items that leave the list can come back in the same proposal.
    for (const item of items) {
      if (removedIds.has(item.id)) {
        existingTitles.delete(normalize(item.title))
      }
    }

    const guarded = guardItems(answer.addItems)

    if (!guarded) {
      return {
        reply:
          'Não consegui montar essa lista. Tente descrever de outro jeito.',
        proposal: null
      }
    }

    const seen = new Set<string>()
    const addItems: AiProposal['addItems'] = []

    for (const item of guarded) {
      const title = item.title
      const key = normalize(title)

      if (seen.has(key) || existingTitles.has(key)) {
        continue
      }

      seen.add(key)
      addItems.push({
        title,
        quantity: Math.min(
          AI_ITEM_MAX_QUANTITY,
          Math.max(1, Math.round(item.quantity) || 1)
        )
      })

      if (addItems.length === MAX_ADD_ITEMS) {
        break
      }
    }

    let title = answer.title?.trim().slice(0, AI_TITLE_MAX) || undefined
    const description =
      answer.description?.trim().slice(0, AI_DESCRIPTION_MAX) || undefined

    if (data.shopperListId) {
      if (!canRename || title === currentTitle) {
        title = undefined
      }
    } else if (!title && addItems.length > 0) {
      title = 'Nova lista'
    }

    const hasChanges =
      !!title ||
      (canRename && !!description) ||
      addItems.length > 0 ||
      removeItems.length > 0

    return {
      reply: answer.reply.trim() || 'Pronto! Veja a sugestão abaixo.',
      proposal: hasChanges
        ? {
            title,
            description: canRename ? description : undefined,
            addItems,
            removeItems
          }
        : null
    }
  }

  private parse(raw: string) {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')

    if (start === -1 || end <= start) {
      return null
    }

    try {
      const parsed = modelAnswerSchema.safeParse(
        JSON.parse(raw.slice(start, end + 1))
      )

      return parsed.success ? parsed.data : null
    } catch {
      return null
    }
  }
}
