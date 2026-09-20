import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { SendEmailService } from '@/services/email/send-email.service.js'
import { CreateCodeService } from '@/services/token/create-code.service.js'
import { GetUserFoundService } from '@/services/users/get-user-found.service.js'
import { ResendCodeService } from '@/services/users/resend-code.service.js'
import { makeEmailDriver } from './make-email-driver.factory.js'

export function makeResendCodeService() {
  const userRepository = new PrismaUserRepository()
  const codeRepository = new PrismaCodeRepository()
  const codeGenerate = new RandomCodeGenerateDriver()
  const createCodeService = new CreateCodeService(
    userRepository,
    codeRepository,
    codeGenerate
  )

  const getUserFound = new GetUserFoundService(userRepository)

  const sendEmailService = new SendEmailService(makeEmailDriver())
  return new ResendCodeService(
    getUserFound,
    userRepository,
    createCodeService,
    sendEmailService
  )
}
