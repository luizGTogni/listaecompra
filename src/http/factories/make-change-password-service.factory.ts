import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { ChangePasswordService } from '@/services/users/change-password.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'

export function makeChangePasswordService() {
  const passwordHasher = new BcryptPasswordHashDriver()
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new ChangePasswordService(
    getUserFound,
    inMemoryUserRepository,
    passwordHasher
  )
}
