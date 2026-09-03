import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { CreateCodeService } from '@/services/token/create-code.service.js'

export function makeCreateCodeService() {
  const codeGenerate = new RandomCodeGenerateDriver()
  return new CreateCodeService(
    inMemoryUserRepository,
    inMemoryCodeRepository,
    codeGenerate
  )
}
