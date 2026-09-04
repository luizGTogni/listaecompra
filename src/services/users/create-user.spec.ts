import { CodeGenerateDriver } from '@/drivers/code/code-generate.driver.js'
import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { MockEmailDriver } from '@/drivers/email/mock-email.driver.js'
import { MockPasswordHashDriver } from '@/drivers/password/mock-password-hash.driver.js'
import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { InMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { CreateCodeService } from '../token/create-code.service.js'
import { CreateUserService } from './create-user.service.js'

let userRepository: UserRepository
let passwordHasher: PasswordHashDriver
let codeRepository: CodeRepository
let codeGenerate: CodeGenerateDriver
let createCodeService: CreateCodeService
let emailDriver: MockEmailDriver
let sendEmailService: SendEmailService
let sut: CreateUserService

describe('Create User Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    passwordHasher = new MockPasswordHashDriver()
    codeRepository = new InMemoryCodeRepository()
    codeGenerate = new RandomCodeGenerateDriver()
    emailDriver = new MockEmailDriver()
    sendEmailService = new SendEmailService(emailDriver)
    createCodeService = new CreateCodeService(
      userRepository,
      codeRepository,
      codeGenerate,
      sendEmailService
    )
    sut = new CreateUserService(
      userRepository,
      passwordHasher,
      createCodeService
    )
  })

  it('should be able to create user', async () => {
    const dataExpected = {
      name: 'John Doe',
      username: 'JohnDoe',
      email: 'Johndoe@email.com',
      passwordPlain: '123456'
    }

    const { user } = await sut.execute(dataExpected)

    expect(user.id).toEqual(expect.any(String))
    expect(user.name).toEqual(dataExpected.name)
    expect(user.username).toEqual(dataExpected.username.toLowerCase())
    expect(user.email).toEqual(dataExpected.email.toLowerCase())
    expect(user.passwordHash).toEqual(`hashed-${dataExpected.passwordPlain}`)
    expect(user.verifiedAt).toEqual(null)
    expect(user.createdAt).toEqual(expect.any(Date))
    expect(user.updatedAt).toEqual(expect.any(Date))
  })

  it('should not be able to create user with username that already exits', async () => {
    await sut.execute({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      passwordPlain: '123456'
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe2@email.com',
        passwordPlain: '123456'
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })

  it('should not be able to create user with email that already exits', async () => {
    await sut.execute({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      passwordPlain: '123456'
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        username: 'johndoe2',
        email: 'johndoe@email.com',
        passwordPlain: '123456'
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
