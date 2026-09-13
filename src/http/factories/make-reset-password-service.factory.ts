import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'
import { ResetPasswordService } from '@/services/users/reset-password.service.js'

export function makeResetPasswordService() {
  const passwordHasher = new BcryptPasswordHashDriver()

  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new ResetPasswordService(
    getUserFound,
    inMemoryUserRepository,
    inMemoryCodeRepository,
    passwordHasher
  )
}
