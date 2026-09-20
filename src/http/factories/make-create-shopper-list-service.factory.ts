import { PrismaShopperListRepository } from '@/repositories/shopper-list-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { CreateShopperListService } from '@/services/shopper/create-shopper-list.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeCreateShopperListService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  const shopperListRepository = new PrismaShopperListRepository()

  return new CreateShopperListService(getUserFound, shopperListRepository)
}
