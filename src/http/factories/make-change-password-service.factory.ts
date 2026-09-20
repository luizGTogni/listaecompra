import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { ChangePasswordService } from '@/services/users/change-password.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeChangePasswordService() {
  const userRepository = new PrismaUserRepository()
  const passwordHasher = new BcryptPasswordHashDriver()
  const getUserFound = new GetUserFoundService(userRepository)

  return new ChangePasswordService(getUserFound, userRepository, passwordHasher)
}
