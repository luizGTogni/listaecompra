import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { SendEmailService } from '@/services/email/send-email.service.js'
import { CreateCodeService } from '@/services/token/create-code.service.js'
import { ForgotPasswordService } from '@/services/users/forgot-password.service.js'
import { makeEmailDriver } from './make-email-driver.factory.js'

export function makeForgotPasswordService() {
  const userRepository = new PrismaUserRepository()
  const codeRepository = new PrismaCodeRepository()
  const codeGenerate = new RandomCodeGenerateDriver()
  const createCodeService = new CreateCodeService(
    userRepository,
    codeRepository,
    codeGenerate
  )
  const sendEmailService = new SendEmailService(makeEmailDriver())
  return new ForgotPasswordService(
    userRepository,
    createCodeService,
    sendEmailService
  )
}
