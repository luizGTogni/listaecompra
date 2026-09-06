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
import { ResendCodeService } from './resend-code.service.js'

let userRepository: UserRepository
let codeRepository: CodeRepository
let codeGenerate: CodeGenerateDriver
let createCodeService: CreateCodeService
let emailDriver: MockEmailDriver
let sendEmailService: SendEmailService
let sut: ResendCodeService

describe('Resend Code Service', () => {
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
    sut = new ResendCodeService(
      userRepository,
      createCodeService,
      sendEmailService
    )
  })

  it('should be able to resend code verification', async () => {
    const dataExpected = {
      name: 'John Doe',
      username: 'JohnDoe',
      email: 'Johndoe@email.com',
      passwordPlain: '123456'
    }

    const user = await userRepository.create({
      ...dataExpected,
      passwordHash: `hashed-${dataExpected.passwordPlain}`
    })

    const code = await codeRepository.create({
      entityId: user.id,
      expiredAt: new Date(Date.now() + 15 * 60 * 1000),
      value: 'A1S5C',
      codeType: 'user_verification'
    })

    await sut.execute({ userId: user.id })

    const oldCode = await codeRepository.findById(code.id)
    const newCode = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    expect(oldCode?.isValid).toBeFalsy()
    expect(newCode[0].value).not.toEqual(oldCode?.value)
  })

  it('should not be able to verify user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
