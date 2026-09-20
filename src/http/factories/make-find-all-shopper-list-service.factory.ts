import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { FindAllShopperListService } from '@/services/shopper/find-all-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeFindAllShopperListService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListRepository = new PrismaShopperListRepository()

  return new FindAllShopperListService(getUserFound, shopperListRepository)
}
