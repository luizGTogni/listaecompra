import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { CreateUserService } from '@/services/users/create-user.service.js'
import { makeCreateCodeService } from './make-create-code-service.factory.js'

export function makeCreateUserService() {
  const passwordHasher = new BcryptPasswordHashDriver()
  const createCodeService = makeCreateCodeService()
  return new CreateUserService(
    inMemoryUserRepository,
    passwordHasher,
    createCodeService
  )
}
