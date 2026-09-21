import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { FindOneUserService } from '@/services/users/find-one-user.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeFindOneUserService() {
  const userRepository = new PrismaUserRepository()
  const getUserFound = new GetUserFoundService(userRepository)
  return new FindOneUserService(getUserFound)
}
