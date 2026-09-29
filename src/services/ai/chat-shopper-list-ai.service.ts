import { ItemUnit } from '@/domain/item-unit.js'
import { AiDriver, AiMessage } from '@/drivers/ai/ai.driver.js'
import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { z } from 'zod'
import {
  AI_ITEM_QUANTITY_MAX,
  guardItems,
  isExcessiveAiQuantity,
  normalizeAiQuantity,
  parseAiUnit
} from './ai-output-guard.js'

export const AI_TITLE_MAX = 60
export const AI_DESCRIPTION_MAX = 200
const MAX_ADD_ITEMS = 40
const PLAIN_REPLY_MAX = 400

interface ChatShopperListAiRequest {
  userId: string
  // Without it the chat is about a list that does not exist yet.
  shopperListId?: string
  messages: AiMessage[]
}

export interface AiProposal {
  title?: string
  description?: string
  addItems: { title: string; quantity: number; unit: ItemUnit }[]
  removeItems: { id: string; title: string }[]
}

interface ChatShopperListAiResponse {
  reply: string
  proposal: AiProposal | null
}

// What the model is asked to answer, before it is cleaned up. Models often
// send null where the prompt says to omit a field, so null counts as omitted.
const modelAnswerSchema = z.object({
  reply: z
    .string()
    .nullish()
    .transform((value) => value ?? ''),
  title: z.string().nullish(),
  description: z.string().nullish(),
  addItems: z
    .array(
      z.object({
        title: z.string(),
        quantity: z.coerce.number(),
        unit: z.string().nullish()
      })
    )
    .nullish()
    .transform((value) => value ?? []),
  removeItemIds: z
    .array(z.string())
    .nullish()
    .transform((value) => value ?? [])
})

const FORMAT_RULES = `Responda SEMPRE em português do Brasil e SOMENTE com um objeto JSON, sem texto fora dele e sem markdown, neste formato:
{"reply": "mensagem curta e amigável para a pessoa", "title": "novo nome da lista (omita se não for mudar)", "description": "nova descrição (omita se não for mudar)", "addItems": [{"title": "Cenoura", "quantity": 3, "unit": "UNIT"}], "removeItemIds": []}
Regras:
- "unit" é a unidade em que o item é comprado e deve ser exatamente uma destas: UNIT (unidade avulsa), KG, G, L, ML, PACK (pacote), BOX (caixa ou fardo), BOTTLE (garrafa), CAN (lata), DOZEN (dúzia).
- "quantity" é um número positivo que conta quantas dessas unidades comprar, nunca doses nem mililitros de bebida servida. Só KG, G, L e ML aceitam decimais (ex.: 1.5 KG, 0.75 L); as demais unidades são sempre inteiras.
- Bebida e comida de embalagem: use a embalagem no título e a contagem em "quantity" (ex.: {"title": "Cachaça 700ml", "quantity": 3, "unit": "BOTTLE"}, {"title": "Cerveja lata 350ml", "quantity": 24, "unit": "CAN"}). O que se compra a granel ou por peso usa KG, G, L ou ML (ex.: {"title": "Picanha", "quantity": 2.5, "unit": "KG"}, {"title": "Leite", "quantity": 2, "unit": "L"}).
- Faça a conta pelo consumo e depois escolha a embalagem: quando o total passar de 24 latas ou garrafas, ou de 30 kg, use uma embalagem maior. Para latas e garrafas isso é BOX (caixa ou fardo de 12 ou 24) e escreva a embalagem no título (ex.: 96 latas de cerveja são {"title": "Cerveja lata 350ml (caixa com 12)", "quantity": 8, "unit": "BOX"}; 72 águas de 500ml são {"title": "Água mineral 500ml (fardo com 12)", "quantity": 6, "unit": "BOX"}). Existe um limite por item e o que passar dele é cortado, então nunca arredonde a quantidade para um número redondo: use o valor da conta. Nunca divida o mesmo produto em vários itens.
- Para eventos, calcule pelo número de convidados e pela duração. Álcool: considere cerca de 70% dos convidados bebendo, e cada um toma por hora 1 drink no consumo alto, 0,5 no moderado e 0,25 no leve (uma lata de 350ml é 1 drink, uma garrafa de vinho de 750ml rende 5 taças, uma garrafa de destilado de 700ml rende 15 doses). Sem álcool: cerca de 1L de refrigerante ou suco e 0,75L de água por pessoa em festas de 6 horas ou mais. Gelo: cerca de 0,5 kg por pessoa quando há bebida gelada. Carne: cerca de 400g por pessoa em churrasco. Em festas com bebida, lembre de gelo e de opções sem álcool.
- Não escreva contas, raciocínio nem explicações fora do JSON: faça as contas de cabeça e responda só com o objeto.
- Se faltar informação para calcular (quantas pessoas, quanto tempo, se bebem álcool), NÃO invente: pergunte em "reply" e deixe "addItems" vazio.
- Títulos de itens são curtos, no singular ou plural natural de mercado (ex.: "Ovos", "Farinha de trigo"), sem a quantidade comprada no texto (a embalagem, como "350ml" ou "caixa com 12", pode ficar).
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
                `- id=${item.id} | ${item.title} | quantidade ${item.quantity} ${item.unit}`
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

    let raw = await this.aiDriver.chat({
      system,
      messages: data.messages
    })

    let answer = this.parse(raw)

    // No JSON at all (the model wrote its reasoning, or was cut): ask once for
    // the JSON only before giving up.
    if (!answer) {
      const retry = await this.retryFormat(system, data.messages, raw)

      if (retry) {
        raw = retry.raw
        answer = retry.answer
      }
    }

    // The model went over a limit: ask it once to redo the account before
    // clamping anything by hand.
    const overLimit = answer ? this.findOverLimit(answer.addItems) : []

    if (answer && overLimit.length > 0) {
      const retry = await this.retryOverLimit(
        system,
        data.messages,
        raw,
        overLimit
      )

      if (retry) {
        raw = retry.raw
        answer = retry.answer
      }
    }

    if (!answer) {
      // The model ignored the format: a short text is still worth showing, a
      // long one is reasoning or a cut answer that would only confuse.
      return {
        reply:
          raw.length <= PLAIN_REPLY_MAX
            ? raw
            : 'Não consegui montar a resposta agora. Tente descrever de outro jeito ou com menos detalhes.',
        proposal: null
      }
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
    const adjusted: string[] = []

    for (const item of guarded) {
      const title = item.title
      const key = normalize(title)

      if (seen.has(key) || existingTitles.has(key)) {
        continue
      }

      seen.add(key)

      const unit = parseAiUnit(item.unit)
      const quantity = normalizeAiQuantity(item.quantity, unit)

      if (isExcessiveAiQuantity(quantity, unit)) {
        const limit = AI_ITEM_QUANTITY_MAX[unit]

        adjusted.push(`${title} (${limit} ${unit})`)
        addItems.push({ title, quantity: limit, unit })
      } else {
        addItems.push({ title, quantity, unit })
      }

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

    let reply = answer.reply.trim() || 'Pronto! Veja a sugestão abaixo.'

    if (adjusted.length > 0) {
      reply += `\n\nA quantidade sugerida ficou exagerada e eu ajustei para o limite: ${adjusted.join(', ')}. Se precisar de mais, me diga quantas pessoas são e por quanto tempo que eu refaço a conta.`
    }

    return {
      reply,
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

  private findOverLimit(
    items: { title: string; quantity: number; unit?: string | null }[]
  ) {
    return items.flatMap((item) => {
      const unit = parseAiUnit(item.unit)
      const quantity = normalizeAiQuantity(item.quantity, unit)
      const max = AI_ITEM_QUANTITY_MAX[unit]

      return isExcessiveAiQuantity(quantity, unit)
        ? [`${item.title.trim()}: ${quantity} ${unit}, máximo ${max}`]
        : []
    })
  }

  private async retryFormat(
    system: string,
    messages: AiMessage[],
    raw: string
  ) {
    try {
      const retryRaw = await this.aiDriver.chat({
        system,
        messages: [
          ...messages,
          { role: 'assistant', content: raw.slice(0, 2000) },
          {
            role: 'user',
            content:
              'Sua resposta não veio no formato pedido. Responda de novo SOMENTE com o objeto JSON, sem contas, explicações nem texto fora dele.'
          }
        ]
      })
      const retryAnswer = this.parse(retryRaw)

      return retryAnswer ? { raw: retryRaw, answer: retryAnswer } : null
    } catch {
      return null
    }
  }

  // A failed retry is not a failure of the chat: the first answer is still
  // usable, its excess is clamped afterwards.
  private async retryOverLimit(
    system: string,
    messages: AiMessage[],
    raw: string,
    overLimit: string[]
  ) {
    try {
      const retryRaw = await this.aiDriver.chat({
        system,
        messages: [
          ...messages,
          { role: 'assistant', content: raw },
          {
            role: 'user',
            content: `Estes itens passaram do limite: ${overLimit.join('; ')}. Refaça o JSON completo respeitando os limites, usando embalagens maiores (caixa, fardo, garrafa de 2L) ou uma quantidade menor, sem dividir o mesmo produto em vários itens. No "reply", fale só do que você sugeriu: não mencione limites, ajustes nem esta correção.`
          }
        ]
      })
      const retryAnswer = this.parse(retryRaw)

      return retryAnswer ? { raw: retryRaw, answer: retryAnswer } : null
    } catch {
      return null
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
