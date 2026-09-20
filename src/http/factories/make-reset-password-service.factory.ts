import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'
import { ResetPasswordService } from '@/services/users/reset-password.service.js'

export function makeResetPasswordService() {
  const userRepository = new PrismaUserRepository()
  const codeRepository = new PrismaCodeRepository()
  const passwordHasher = new BcryptPasswordHashDriver()

  const getUserFound = new GetUserFoundService(userRepository)

  return new ResetPasswordService(
    getUserFound,
    userRepository,
    codeRepository,
    passwordHasher
  )
}
