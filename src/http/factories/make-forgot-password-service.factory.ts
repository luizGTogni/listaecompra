import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { SendEmailService } from '@/services/email/send-email.service.js'
import { CreateCodeService } from '@/services/token/create-code.service.js'
import { ForgotPasswordService } from '@/services/users/forgot-password.service.js'
import { makeEmailDriver } from './make-email-driver.factory.js'

export function makeForgotPasswordService() {
  const codeGenerate = new RandomCodeGenerateDriver()
  const createCodeService = new CreateCodeService(
    inMemoryUserRepository,
    inMemoryCodeRepository,
    codeGenerate
  )
  const sendEmailService = new SendEmailService(makeEmailDriver())
  return new ForgotPasswordService(
    inMemoryUserRepository,
    createCodeService,
    sendEmailService
  )
}
