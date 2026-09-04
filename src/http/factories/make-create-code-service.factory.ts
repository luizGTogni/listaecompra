import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { ResendEmailDriver } from '@/drivers/email/resend-email.driver.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { SendEmailService } from '@/services/email/send-email.service.js'
import { CreateCodeService } from '@/services/token/create-code.service.js'

export function makeCreateCodeService() {
  const codeGenerate = new RandomCodeGenerateDriver()
  const emailDriver = new ResendEmailDriver()
  const sendEmailService = new SendEmailService(emailDriver)
  return new CreateCodeService(
    inMemoryUserRepository,
    inMemoryCodeRepository,
    codeGenerate,
    sendEmailService
  )
}
