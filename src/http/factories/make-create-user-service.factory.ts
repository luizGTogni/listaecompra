import { BcryptPasswordHashDriver } from '@/drivers/password/bcrypt-password-hash.driver.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { SendEmailService } from '@/services/email/send-email.service.js'
import { CreateUserService } from '@/services/users/create-user.service.js'
import { makeCreateCodeService } from './make-create-code-service.factory.js'
import { makeEmailDriver } from './make-email-driver.factory.js'

export function makeCreateUserService() {
  const userRepository = new PrismaUserRepository()
  const passwordHasher = new BcryptPasswordHashDriver()
  const createCodeService = makeCreateCodeService()
  const sendEmailService = new SendEmailService(makeEmailDriver())
  return new CreateUserService(
    userRepository,
    passwordHasher,
    createCodeService,
    sendEmailService
  )
}
