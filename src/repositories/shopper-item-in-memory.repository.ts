import { ShopperItem, ShopperItemInput } from '@/domain/shopper-item.entity.js'
import { randomUUID } from 'node:crypto'
import { ShopperItemRepository } from './shopper-item.repository.js'

export class InMemoryShopperItemRepository implements ShopperItemRepository {
  private items: ShopperItem[] = []

  async create(data: ShopperItemInput) {
    const shopperItem: ShopperItem = {
      id: randomUUID(),
      shopperListId: data.shopperListId,
      title: data.title,
      description: data.description,
      quantity: data.quantity,
      purchasedAt: null,
      createdAt: new Date()
    }

    this.items.push(shopperItem)

    return { ...shopperItem }
  }

  async update(shopperItem: ShopperItem) {
    const shopperItemIndex = this.items.findIndex(
      (item) => item.id === shopperItem.id
    )

    this.items[shopperItemIndex] = shopperItem

    return { ...shopperItem }
  }

  async delete(id: string) {
    const shopperItems = this.items.filter((item) => item.id !== id)

    this.items = shopperItems
  }

  async deleteAll() {
    this.items = []
  }

  async findByIdAndShopperListId(id: string, shopperListId: string) {
    const shopperItem = this.items.find(
      (item) => item.id === id && item.shopperListId === shopperListId
    )

    return shopperItem ? { ...shopperItem } : null
  }

  async findByTitleAndShopperListId(title: string, shopperListId: string) {
    const shopperItem = this.items.find(
      (item) => item.title === title && item.shopperListId === shopperListId
    )

    return shopperItem ? { ...shopperItem } : null
  }

  async findAllByShopperListId(shopperListId: string) {
    return this.items.filter((item) => item.shopperListId === shopperListId)
  }
}

export const inMemoryShopperItemRepository = new InMemoryShopperItemRepository()
