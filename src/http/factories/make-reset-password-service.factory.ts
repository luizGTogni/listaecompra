import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { ResetPasswordService } from '@/services/users/reset-password.service.js'

export function makeResetPasswordService() {
  const passwordHasher = new BcryptPasswordHashDriver()
  return new ResetPasswordService(
    inMemoryUserRepository,
    inMemoryCodeRepository,
    passwordHasher
  )
}
