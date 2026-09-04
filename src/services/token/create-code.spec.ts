import { CodeGenerateDriver } from '@/drivers/code/code-generate.driver.js'
import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { MockEmailDriver } from '@/drivers/email/mock-email.driver.js'
import { InMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { CreateCodeService } from './create-code.service.js'

let userRepository: UserRepository
let codeRepository: CodeRepository
let codeGenerate: CodeGenerateDriver
let emailDriver: MockEmailDriver
let sendEmailService: SendEmailService
let sut: CreateCodeService

describe('Create Code Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    codeRepository = new InMemoryCodeRepository()
    codeGenerate = new RandomCodeGenerateDriver()
    emailDriver = new MockEmailDriver()
    sendEmailService = new SendEmailService(emailDriver)
    sut = new CreateCodeService(
      userRepository,
      codeRepository,
      codeGenerate,
      sendEmailService
    )
  })

  it('should be able to create code', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      passwordHash: 'hasher-41245'
    })

    const { code } = await sut.execute({ userId: user.id })

    const codesDb = await codeRepository.findAllActiveByEntityId(user.id)

    expect(codesDb.length).toEqual(1)
    expect(codesDb[0].entityId).toEqual(user.id)

    expect(code).toEqual(codesDb[0])
  })

  it('should be able to create second code and delete first code', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      passwordHash: 'hasher-41245'
    })

    const response = await sut.execute({ userId: user.id })

    const response2 = await sut.execute({ userId: user.id })

    const code1 = await codeRepository.findById(response.code.id)
    const code2 = await codeRepository.findById(response2.code.id)

    expect(code1?.isValid).toBeFalsy()
    expect(code2?.isValid).toBeTruthy()
  })

  it('should send verification code email', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      passwordHash: 'hasher-41245'
    })

    await sut.execute({ userId: user.id })

    expect(emailDriver.emails).toHaveLength(1)
    expect(emailDriver.emails[0]).toEqual({
      from: 'from@test.com',
      to: user.email,
      subject: 'Lista&Compra - Verification Code',
      body: expect.any(String)
    })
  })
})
