import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'
import { VerifyUserService } from '@/services/users/verify-user.service.js'

export function makeVerifyUserService() {
  const userRepository = new PrismaUserRepository()
  const codeRepository = new PrismaCodeRepository()
  const getUserFound = new GetUserFoundService(userRepository)

  return new VerifyUserService(getUserFound, userRepository, codeRepository)
}
