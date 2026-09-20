import { prisma } from '@/config/prisma.js'
import { ShopperList, ShopperListInput } from '@/domain/shopper-list.entity.js'
import { isUuid } from '@/utils/is-uuid.js'
import {
  FilterParams,
  ShopperListRepository
} from './shopper-list.repository.js'

export class PrismaShopperListRepository implements ShopperListRepository {
  private ITEMS_PER_PAGE = 10

  async create(data: ShopperListInput) {
    const shopperList = await prisma.shopperList.create({ data })

    return { ...shopperList }
  }

  async update(shopperList: ShopperList) {
    const shopperListUpdated = await prisma.shopperList.update({
      where: { id: shopperList.id },
      data: shopperList
    })

    return { ...shopperListUpdated }
  }

  async delete(id: string) {
    await prisma.shopperList.delete({ where: { id } })
  }

  async deleteAll() {
    await prisma.shopperList.deleteMany()
  }

  async findById(id: string) {
    if (!isUuid(id)) {
      return null
    }

    const shopperList = await prisma.shopperList.findUnique({ where: { id } })

    return shopperList ? { ...shopperList } : null
  }

  async findByIdAndUserId(id: string, userId: string) {
    if (!isUuid(id)) {
      return null
    }

    const shopperList = await prisma.shopperList.findFirst({
      where: { id, userId }
    })

    return shopperList ? { ...shopperList } : null
  }

  async findByTitleAndUserId(title: string, userId: string) {
    const shopperList = await prisma.shopperList.findFirst({
      where: { title, userId }
    })

    return shopperList ? { ...shopperList } : null
  }

  async findAllByUserId(userId: string, filters: FilterParams) {
    const shopperLists = await prisma.shopperList.findMany({
      where: {
        userId,
        title: { contains: filters.query, mode: 'insensitive' }
      },
      orderBy: { createdAt: 'asc' },
      take: this.ITEMS_PER_PAGE,
      skip: (filters.page - 1) * this.ITEMS_PER_PAGE
    })

    return shopperLists
  }
}
