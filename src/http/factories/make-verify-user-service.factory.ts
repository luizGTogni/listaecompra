import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { VerifyUserService } from '@/services/users/verify-user.service.js'

export function makeVerifyUserService() {
  return new VerifyUserService(inMemoryUserRepository, inMemoryCodeRepository)
}
