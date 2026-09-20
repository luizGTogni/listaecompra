import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { AuthService } from '@/services/users/auth.service.js'

export function makeAuthService() {
  const userRepository = new PrismaUserRepository()
  const passwordHasher = new BcryptPasswordHashDriver()
  return new AuthService(userRepository, passwordHasher)
}
