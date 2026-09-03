import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { AuthService } from '@/services/users/auth.service.js'

export function makeAuthService() {
  const passwordHasher = new BcryptPasswordHashDriver()
  return new AuthService(inMemoryUserRepository, passwordHasher)
}
