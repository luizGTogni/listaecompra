import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { SendEmailService } from '@/services/email/send-email.service.js'
import { CreateCodeService } from '@/services/token/create-code.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'
import { ResendCodeService } from '@/services/users/resend-code.service.js'
import { makeEmailDriver } from './make-email-driver.factory.js'

export function makeResendCodeService() {
  const codeGenerate = new RandomCodeGenerateDriver()
  const createCodeService = new CreateCodeService(
    inMemoryUserRepository,
    inMemoryCodeRepository,
    codeGenerate
  )

  const getUserFound = new GetUserFoundService(inMemoryUserRepository)

  const sendEmailService = new SendEmailService(makeEmailDriver())
  return new ResendCodeService(
    getUserFound,
    inMemoryUserRepository,
    createCodeService,
    sendEmailService
  )
}
