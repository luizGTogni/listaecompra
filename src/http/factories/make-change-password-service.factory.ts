import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { ChangePasswordService } from '@/services/users/change-password.service.js'

export function makeChangePasswordService() {
  const passwordHasher = new BcryptPasswordHashDriver()
  return new ChangePasswordService(inMemoryUserRepository, passwordHasher)
}
