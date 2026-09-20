import { prisma } from '@/config/prisma.js'
import { ShopperItem, ShopperItemInput } from '@/domain/shopper-item.entity.js'
import { isUuid } from '@/utils/is-uuid.js'
import { ShopperItemRepository } from './shopper-item.repository.js'

export class PrismaShopperItemRepository implements ShopperItemRepository {
  async create(data: ShopperItemInput) {
    const shopperItem = await prisma.shopperItem.create({
      data
    })

    return { ...shopperItem }
  }

  async update(shopperItem: ShopperItem) {
    const shopperItemUpdated = await prisma.shopperItem.update({
      where: { id: shopperItem.id },
      data: shopperItem
    })

    return { ...shopperItemUpdated }
  }

  async delete(id: string) {
    await prisma.shopperItem.delete({ where: { id } })
  }

  async deleteAll() {
    await prisma.shopperItem.deleteMany()
  }

  async findByIdAndShopperListId(id: string, shopperListId: string) {
    if (!isUuid(id) || !isUuid(shopperListId)) {
      return null
    }

    const shopperItem = await prisma.shopperItem.findFirst({
      where: { id, shopperListId }
    })

    return shopperItem ? { ...shopperItem } : null
  }

  async findByTitleAndShopperListId(title: string, shopperListId: string) {
    const shopperItem = await prisma.shopperItem.findFirst({
      where: { title, shopperListId }
    })

    return shopperItem ? { ...shopperItem } : null
  }

  async findAllByShopperListId(shopperListId: string) {
    const shopperItem = await prisma.shopperItem.findMany({
      where: { shopperListId }
    })

    return shopperItem
  }
}
