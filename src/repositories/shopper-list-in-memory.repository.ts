import { ShopperList, ShopperListInput } from '@/domain/shopper-list.entity.js'
import { randomUUID } from 'node:crypto'
import { inMemoryShopperItemRepository } from './shopper-item-in-memory.repository.js'
import { ShopperItemRepository } from './shopper-item.repository.js'
import {
  FilterParams,
  ShopperListRepository,
  ShopperListWithUser
} from './shopper-list.repository.js'
import { inMemoryUserRepository } from './user-in-memory.repository.js'
import { UserRepository } from './user.repository.js'

export class InMemoryShopperListRepository implements ShopperListRepository {
  private items: ShopperList[] = []

  constructor(
    private userRepository: UserRepository = inMemoryUserRepository,
    private shopperItemRepository: ShopperItemRepository = inMemoryShopperItemRepository
  ) {}

  private async getOwner(userId: string) {
    const user = await this.userRepository.findById(userId)

    return { name: user?.name ?? '', username: user?.username ?? '' }
  }

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

  async findById(id: string) {
    const shopperList = this.items.find((item) => item.id === id)

    return shopperList ? { ...shopperList } : null
  }

  async findWithItemsAndUserById(id: string) {
    const shopperList = this.items.find((item) => item.id === id)

    if (!shopperList) {
      return null
    }

    const shopperItems =
      await this.shopperItemRepository.findAllByShopperListId(shopperList.id)

    return {
      ...shopperList,
      user: await this.getOwner(shopperList.userId),
      shopperItems
    }
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
    const START_INDEX = (filters.page - 1) * filters.limit
    const END_INDEX = filters.limit * filters.page

    let filtered = this.items

    if (filters.status) {
      filtered = filtered.filter((item) =>
        filters.status === 'open' ? !item.closedAt : item.closedAt
      )
    }

    filtered = filtered.filter(
      (item) =>
        item.userId === userId &&
        (item.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.description.toLowerCase().includes(filters.query.toLowerCase()))
    )

    const shopperLists: ShopperListWithUser[] = await Promise.all(
      filtered.slice(START_INDEX, END_INDEX).map(async (item) => ({
        ...item,
        user: await this.getOwner(item.userId)
      }))
    )

    return {
      shopperLists,
      page: filters.page,
      perPage: filters.limit,
      total: filtered.length
    }
  }
}

export const inMemoryShopperListRepository = new InMemoryShopperListRepository()
