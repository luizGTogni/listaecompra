import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { CreateCodeService } from '@/services/token/create-code.service.js'

export function makeCreateCodeService() {
  const userRepository = new PrismaUserRepository()
  const codeRepository = new PrismaCodeRepository()
  const codeGenerate = new RandomCodeGenerateDriver()

  return new CreateCodeService(userRepository, codeRepository, codeGenerate)
}
