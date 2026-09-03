import { CodeExpiredError } from '@/http/types/errors/code-expired.error.js'
import { CodeInvalidError } from '@/http/types/errors/code-invalid.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { UserAlreadyVerifiedError } from '@/http/types/errors/user-already-verified.js'
import { InMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { VerifyUserService } from './verify-user.service.js'

let userRepository: UserRepository
let codeRepository: CodeRepository
let sut: VerifyUserService

describe('Verify User Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    codeRepository = new InMemoryCodeRepository()
    sut = new VerifyUserService(userRepository, codeRepository)

    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to verify user with code verification created', async () => {
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
      value: 'A1S5C'
    })

    expect(user.verifiedAt).toBeNull()

    await sut.execute({
      userId: user.id,
      codeValue: code.value
    })

    const userUpdated = await userRepository.findById(user.id)

    expect(userUpdated?.verifiedAt).toEqual(expect.any(Date))
  })

  it('should not be able to verify user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        codeValue: 'AAAAA'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to verify user if code not found', async () => {
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

    user.verifiedAt = new Date()

    await userRepository.update(user)

    await expect(() =>
      sut.execute({
        userId: user.id,
        codeValue: 'AAAAA'
      })
    ).rejects.toBeInstanceOf(UserAlreadyVerifiedError)
  })

  it('should not be able to verify user if code not found', async () => {
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

    await expect(() =>
      sut.execute({
        userId: user.id,
        codeValue: 'CODENOTFOUND'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to verify user if code not found', async () => {
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
      value: 'A1S5C'
    })

    code.isValid = false

    await codeRepository.update(code)

    await expect(() =>
      sut.execute({
        userId: user.id,
        codeValue: code.value
      })
    ).rejects.toBeInstanceOf(CodeInvalidError)
  })

  it('should not be able to verify user if code expired', async () => {
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
      value: 'A1S5C'
    })

    vi.setSystemTime(new Date('2026-09-01T10:16:00Z'))

    await expect(() =>
      sut.execute({
        userId: user.id,
        codeValue: code.value
      })
    ).rejects.toBeInstanceOf(CodeExpiredError)
  })

  // SERVICE EMAI (NODEMAILER)
})
