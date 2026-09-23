import { prisma } from '@/config/prisma.js'
import { ShopperList, ShopperListInput } from '@/domain/shopper-list.entity.js'
import { isUuid } from '@/utils/is-uuid.js'
import {
  FilterParams,
  ShopperListRepository
} from './shopper-list.repository.js'

export class PrismaShopperListRepository implements ShopperListRepository {
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

  async findWithItemsAndUserById(id: string) {
    if (!isUuid(id)) {
      return null
    }

    const shopperList = await prisma.shopperList.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, username: true } },
        shopperItems: {
          orderBy: { createdAt: 'asc' },
          select: {
            title: true,
            quantity: true,
            id: true,
            createdAt: true,
            description: true,
            purchasedAt: true,
            shopperListId: true
          }
        }
      }
    })

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
    const [shopperLists, total] = await prisma.$transaction([
      prisma.shopperList.findMany({
        where: {
          AND: [
            {
              OR: [
                { userId },
                {
                  shopperListMembers: {
                    some: { memberId: userId, acceptedAt: { not: null } }
                  }
                }
              ]
            },
            {
              OR: [
                { title: { contains: filters.query, mode: 'insensitive' } },
                {
                  description: { contains: filters.query, mode: 'insensitive' }
                }
              ]
            },
            filters.status
              ? {
                  closedAt:
                    filters.status === 'open' ? { equals: null } : { not: null }
                }
              : {}
          ]
        },
        include: { user: { select: { name: true, username: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: filters.limit,
        skip: (filters.page - 1) * filters.limit
      }),
      prisma.shopperList.count({
        where: {
          AND: [
            {
              OR: [
                { userId },
                {
                  shopperListMembers: {
                    some: { memberId: userId, acceptedAt: { not: null } }
                  }
                }
              ]
            },
            {
              OR: [
                { title: { contains: filters.query, mode: 'insensitive' } },
                {
                  description: { contains: filters.query, mode: 'insensitive' }
                }
              ]
            },
            filters.status
              ? {
                  closedAt:
                    filters.status === 'open' ? { equals: null } : { not: null }
                }
              : {}
          ]
        }
      })
    ])

    return {
      shopperLists,
      page: filters.page,
      perPage: filters.limit,
      total
    }
  }
}
