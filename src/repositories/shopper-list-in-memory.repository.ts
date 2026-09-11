import { ShopperList, ShopperListInput } from '@/domain/shopper-list.entity.js'
import { randomUUID } from 'node:crypto'
import {
  FilterParams,
  ShopperListRepository
} from './shopper-list.repository.js'

export class InMemoryShopperListRepository implements ShopperListRepository {
  private ITEMS_PER_PAGE = 10
  private items: ShopperList[] = []

  async create(data: ShopperListInput) {
    const shopperList: ShopperList = {
      id: randomUUID(),
      userId: data.userId,
      title: data.title,
      description: data.description,
      closedAt: null,
      createdAt: new Date()
    }

    this.items.push(shopperList)

    return { ...shopperList }
  }

  async update(shopperList: ShopperList) {
    const shopperListIndex = this.items.findIndex(
      (item) => item.id === shopperList.id
    )

    this.items[shopperListIndex] = shopperList

    return { ...this.items[shopperListIndex] }
  }

  async delete(id: string) {
    const shopperLists = this.items.filter((item) => item.id !== id)

    this.items = shopperLists
  }

  async deleteAll() {
    this.items = []
  }

  async findByIdAndUserId(id: string, userId: string) {
    const shopperList = this.items.find(
      (item) => item.id === id && item.userId === userId
    )

    return shopperList ? { ...shopperList } : null
  }

  async findByTitleAndUserId(title: string, userId: string) {
    const shopperList = this.items.find(
      (item) => item.title === title && item.userId === userId
    )

    return shopperList ? { ...shopperList } : null
  }

  async findAllByUserId(userId: string, filters: FilterParams) {
    const START_INDEX = (filters.page - 1) * this.ITEMS_PER_PAGE
    const END_INDEX = this.ITEMS_PER_PAGE * filters.page

    const shopperLists = this.items
      .filter(
        (item) =>
          item.userId === userId &&
          item.title.toLowerCase().includes(filters.query.toLowerCase())
      )
      .slice(START_INDEX, END_INDEX)

    return shopperLists.map((item) => ({ ...item }))
  }
}

export const inMemoryShopperListRepository = new InMemoryShopperListRepository()
