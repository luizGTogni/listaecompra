import { prisma } from '@/config/prisma.js'
import {
  ShopperListMember,
  ShopperListMemberInput
} from '@/domain/shopper-list-member.entity.js'
import { isUuid } from '@/utils/is-uuid.js'
import { ShopperListMemberRepository } from './shopper-list-member.repository.js'

export class PrismaShopperListMemberRepository implements ShopperListMemberRepository {
  async create(data: ShopperListMemberInput) {
    const shopperListMember = await prisma.shopperListMember.create({ data })

    return { ...shopperListMember }
  }

  async update(shopperListMember: ShopperListMember) {
    const shopperListMemberUpdated = await prisma.shopperListMember.update({
      where: {
        shopperListId_memberId: {
          shopperListId: shopperListMember.shopperListId,
          memberId: shopperListMember.memberId
        }
      },

      data: shopperListMember
    })

    return { ...shopperListMemberUpdated }
  }

  async deleteByShopperListIdAndMemberId(
    shopperListId: string,
    memberId: string
  ) {
    await prisma.shopperListMember.delete({
      where: { shopperListId_memberId: { shopperListId, memberId } }
    })
  }

  async deleteAll() {
    await prisma.shopperListMember.deleteMany()
  }

  async deleteAllByShopperListId(shopperListId: string) {
    await prisma.shopperListMember.deleteMany({ where: { shopperListId } })
  }

  async findByShopperListIdAndMemberId(
    shopperListId: string,
    memberId: string
  ) {
    if (!isUuid(shopperListId) || !isUuid(memberId)) {
      return null
    }

    const membership = await prisma.shopperListMember.findFirst({
      where: { shopperListId, memberId }
    })

    return membership ? { ...membership } : null
  }

  async findAllByShopperListId(shopperListId: string) {
    const shopperListMembers = await prisma.shopperListMember.findMany({
      where: { shopperListId }
    })

    return shopperListMembers
  }

  async findAllByMemberId(memberId: string, onlyInvite: boolean) {
    if (onlyInvite) {
      const shopperListMembers = await prisma.shopperListMember.findMany({
        where: { memberId, acceptedAt: null }
      })

      return shopperListMembers
    }

    const shopperListMembers = await prisma.shopperListMember.findMany({
      where: { memberId, acceptedAt: { not: null } }
    })

    return shopperListMembers
  }
}
