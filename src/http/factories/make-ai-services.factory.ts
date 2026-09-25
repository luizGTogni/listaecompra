import { PrismaShopperItemRepository } from '@/repositories/shopper-item-prisma.repository.js'
import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { ApplyShopperListAiProposalService } from '@/services/ai/apply-shopper-list-ai-proposal.service.js'
import { ChatShopperListAiService } from '@/services/ai/chat-shopper-list-ai.service.js'
import { GetShopperListAccessService } from '@/services/shopper/get-shopper-list-access.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'
import { makeAiDriver } from './make-ai-driver.factory.js'

function makeDependencies() {
  const shopperListRepository = new PrismaShopperListRepository()

  return {
    getUserFound: new GetUserFoundService(new PrismaUserRepository()),
    shopperListRepository,
    shopperItemRepository: new PrismaShopperItemRepository(),
    getShopperListAccess: new GetShopperListAccessService(
      shopperListRepository,
      new PrismaShopperListMemberRepository()
    )
  }
}

export function makeChatShopperListAiService() {
  const deps = makeDependencies()

  return new ChatShopperListAiService(
    deps.getUserFound,
    deps.getShopperListAccess,
    deps.shopperListRepository,
    makeAiDriver()
  )
}

export function makeApplyShopperListAiProposalService() {
  const deps = makeDependencies()

  return new ApplyShopperListAiProposalService(
    deps.getUserFound,
    deps.getShopperListAccess,
    deps.shopperListRepository,
    deps.shopperItemRepository
  )
}
