import { CodeGenerateDriver } from '@/drivers/code/code-generate.driver.js'
import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { MockEmailDriver } from '@/drivers/email/mock-email.driver.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { TooManyRequestsError } from '@/http/types/errors/too-many-requests.error.js'
import { InMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { CreateCodeService } from '../token/create-code.service.js'
import { GetUserFoundService } from './get-user-found.service.js'
import { ResendCodeService } from './resend-code.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let codeRepository: CodeRepository
let codeGenerate: CodeGenerateDriver
let createCodeService: CreateCodeService
let emailDriver: MockEmailDriver
let sendEmailService: SendEmailService
let sut: ResendCodeService

async function createUser(email = 'Johndoe@email.com') {
  return userRepository.create({
    name: 'John Doe',
    username: email.split('@')[0],
    email,
    passwordHash: 'hashed-123456'
  })
}

async function createVerificationCode(userId: string) {
  return codeRepository.create({
    entityId: userId,
    expiredAt: new Date(Date.now() + 15 * 60 * 1000),
    value: 'A1S5C',
    codeType: 'user_verification'
  })
}

describe('Resend Code Service', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
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
      getUserFound,
      codeRepository,
      createCodeService,
      sendEmailService
    )
  })

  afterEach(() => {
    vi.useRealTimers()
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

    vi.advanceTimersByTime(61 * 1000)

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

  it('should be able to resend code when user has no active code', async () => {
    const user = await createUser()

    await sut.execute({ userId: user.id })

    const codes = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    expect(codes).toHaveLength(1)
    expect(emailDriver.emails).toHaveLength(1)
    expect(emailDriver.emails[0].to).toEqual(user.email)
  })

  it('should not be able to resend code during the cooldown', async () => {
    const user = await createUser()
    await createVerificationCode(user.id)

    await expect(() => sut.execute({ userId: user.id })).rejects.toBeInstanceOf(
      TooManyRequestsError
    )
  })

  it('should return the remaining seconds of the cooldown', async () => {
    const user = await createUser()
    await createVerificationCode(user.id)

    vi.advanceTimersByTime(20 * 1000)

    await expect(sut.execute({ userId: user.id })).rejects.toMatchObject({
      statusCode: 429,
      retryAfterSeconds: 40
    })
  })

  it('should not create a new code nor send email during the cooldown', async () => {
    const user = await createUser()
    const code = await createVerificationCode(user.id)

    await expect(sut.execute({ userId: user.id })).rejects.toBeInstanceOf(
      TooManyRequestsError
    )

    const codes = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    expect(codes).toHaveLength(1)
    expect(codes[0].id).toEqual(code.id)
    expect(emailDriver.emails).toHaveLength(0)
  })

  it('should be able to resend code right after the cooldown', async () => {
    const user = await createUser()
    await createVerificationCode(user.id)

    vi.advanceTimersByTime(61 * 1000)

    await expect(sut.execute({ userId: user.id })).resolves.toBeUndefined()
    expect(emailDriver.emails).toHaveLength(1)
  })

  it('should start a new cooldown after resending the code', async () => {
    const user = await createUser()
    await createVerificationCode(user.id)

    vi.advanceTimersByTime(61 * 1000)
    await sut.execute({ userId: user.id })

    await expect(sut.execute({ userId: user.id })).rejects.toBeInstanceOf(
      TooManyRequestsError
    )
    expect(emailDriver.emails).toHaveLength(1)
  })

  it('should apply the cooldown per user', async () => {
    const userA = await createUser('a@email.com')
    const userB = await createUser('b@email.com')
    await createVerificationCode(userA.id)

    await expect(sut.execute({ userId: userB.id })).resolves.toBeUndefined()
  })
})
