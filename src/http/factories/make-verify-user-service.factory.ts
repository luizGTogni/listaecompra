import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'
import { VerifyUserService } from '@/services/users/verify-user.service.js'

export function makeVerifyUserService() {
  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  return new VerifyUserService(
    getUserFound,
    inMemoryUserRepository,
    inMemoryCodeRepository
  )
}
