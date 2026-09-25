import { ForbbidenError } from '@/http/types/errors/forbbiden.error.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { ShopperListClosedError } from '@/http/types/errors/shopper-list-closed.error.js'
import { ShopperItemRepository } from '@/repositories/shopper-item.repository.js'
import { ShopperListRepository } from '@/repositories/shopper-list.repository.js'
import { GetShopperListAccessService } from '../shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '../users/get-user-found.service.js'
import { isValidItemTitle } from './ai-output-guard.js'

interface ApplyShopperListAiProposalRequest {
  userId: string
  // Without it a new list is created from the proposal.
  shopperListId?: string
  title?: string
  description?: string
  addItems: { title: string; quantity: number }[]
  removeItemIds: string[]
}

interface ApplyShopperListAiProposalResponse {
  shopperListId: string
  added: number
  removed: number
}

export class ApplyShopperListAiProposalService {
  constructor(
    private getUserFound: GetUserFoundService,
    private getShopperListAccess: GetShopperListAccessService,
    private shopperListRepository: ShopperListRepository,
    private shopperItemRepository: ShopperItemRepository
  ) {}

  async execute(
    data: ApplyShopperListAiProposalRequest
  ): Promise<ApplyShopperListAiProposalResponse> {
    await this.getUserFound.execute({ userId: data.userId })

    if (!data.shopperListId) {
      return this.createList(data)
    }

    const shopperList = await this.getShopperListAccess.execute({
      shopperListId: data.shopperListId,
      userId: data.userId
    })

    if (shopperList.closedAt) {
      throw new ShopperListClosedError()
    }

    const renames = data.title !== undefined || data.description !== undefined

    if (renames && shopperList.userId !== data.userId) {
      throw new ForbbidenError()
    }

    if (renames) {
      const title = data.title ?? shopperList.title
      const sameTitle = await this.shopperListRepository.findByTitleAndUserId(
        title,
        shopperList.userId
      )

      if (sameTitle && sameTitle.id !== shopperList.id) {
        throw new ResourceAlreadyExistsError()
      }

      await this.shopperListRepository.update({
        ...shopperList,
        title,
        description: data.description ?? shopperList.description
      })
    }

    let removed = 0

    for (const shopperItemId of data.removeItemIds) {
      const shopperItem =
        await this.shopperItemRepository.findByIdAndShopperListId(
          shopperItemId,
          shopperList.id
        )

      if (shopperItem) {
        await this.shopperItemRepository.delete(shopperItem.id)
        removed += 1
      }
    }

    const added = await this.addItems(shopperList.id, data.addItems)

    return { shopperListId: shopperList.id, added, removed }
  }

  private async createList(data: ApplyShopperListAiProposalRequest) {
    const baseTitle = data.title?.trim() || 'Nova lista'
    // Titles are unique per owner: "Bolo de cenoura (2)" instead of an error.
    let title = baseTitle
    let suffix = 2

    while (
      await this.shopperListRepository.findByTitleAndUserId(title, data.userId)
    ) {
      title = `${baseTitle} (${suffix})`
      suffix += 1
    }

    const shopperList = await this.shopperListRepository.create({
      userId: data.userId,
      title,
      description: data.description ?? ''
    })

    const added = await this.addItems(shopperList.id, data.addItems)

    return { shopperListId: shopperList.id, added, removed: 0 }
  }

  private async addItems(
    shopperListId: string,
    items: ApplyShopperListAiProposalRequest['addItems']
  ) {
    const existing =
      await this.shopperItemRepository.findAllByShopperListId(shopperListId)
    const titles = new Set(existing.map((item) => item.title.toLowerCase()))
    let added = 0

    for (const item of items) {
      const key = item.title.trim().toLowerCase()

      // The client may have edited the proposal: check it again here.
      if (!isValidItemTitle(item.title) || titles.has(key)) {
        continue
      }

      titles.add(key)
      await this.shopperItemRepository.create({
        shopperListId,
        title: item.title.trim(),
        description: '',
        quantity: item.quantity
      })
      added += 1
    }

    return added
  }
}
