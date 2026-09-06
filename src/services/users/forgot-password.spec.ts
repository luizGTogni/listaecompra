import { CodeGenerateDriver } from '@/drivers/code/code-generate.driver.js'
import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { MockEmailDriver } from '@/drivers/email/mock-email.driver.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { CreateCodeService } from '../token/create-code.service.js'
import { ForgotPasswordService } from './forgot-password.service.js'

let userRepository: UserRepository
let codeRepository: CodeRepository
let codeGenerate: CodeGenerateDriver
let createCodeService: CreateCodeService
let emailDriver: MockEmailDriver
let sendEmailService: SendEmailService
let sut: ForgotPasswordService

describe('Forgot Password Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    codeRepository = new InMemoryCodeRepository()
    codeGenerate = new RandomCodeGenerateDriver()
    emailDriver = new MockEmailDriver()
    sendEmailService = new SendEmailService(emailDriver)
    createCodeService = new CreateCodeService(
      userRepository,
      codeRepository,
      codeGenerate
    )
    sut = new ForgotPasswordService(
      userRepository,
      createCodeService,
      sendEmailService
    )
  })

  it('should not be able to forgot user password if user not found', async () => {
    await expect(() =>
      sut.execute({ email: 'user@notfound.com' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be able to forgot user password', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: 'hasher-123456'
    })

    await sut.execute({ email: user.email })

    const codeCreated = await codeRepository.findAllActiveByEntityId(
      user.id,
      'password_reset'
    )

    expect(codeCreated[0].value).toHaveLength(6)
    expect(codeCreated[0].value).toEqual(expect.any(String))

    expect(emailDriver.emails).toHaveLength(1)
    expect(emailDriver.emails[0]).toEqual({
      from: 'from@test.com',
      to: user.email,
      subject: 'Lista&Compra - Reset Password',
      body: expect.any(String)
    })
  })
})
