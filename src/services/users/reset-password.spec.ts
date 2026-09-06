import { MockPasswordHashDriver } from '@/drivers/password/mock-password-hash.driver.js'
import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { CodeExpiredError } from '@/http/types/errors/code-expired.error.js'
import { CodeInvalidError } from '@/http/types/errors/code-invalid.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { ResetPasswordService } from './reset-password.service.js'

let userRepository: UserRepository
let codeRepository: CodeRepository
let passwordHash: PasswordHashDriver
let sut: ResetPasswordService

describe('Reset Password Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    codeRepository = new InMemoryCodeRepository()
    passwordHash = new MockPasswordHashDriver()
    sut = new ResetPasswordService(userRepository, codeRepository, passwordHash)

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to reset user password', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: await passwordHash.hash('123456')
    })

    const code = await codeRepository.create({
      value: 'A1BC5S',
      codeType: 'password_reset',
      entityId: user.id,
      expiredAt: new Date()
    })

    await sut.execute({ codeValue: code.value, newPassword: 'newpassword' })

    const codeUpdated = await codeRepository.findByValue(
      code.value,
      'password_reset'
    )
    const userUpdated = await userRepository.findById(user.id)

    expect(codeUpdated?.isValid).toBeFalsy()
    expect(userUpdated?.passwordHash).toEqual('hashed-newpassword')
  })

  it('should not be able to reset user password if code invalid', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: await passwordHash.hash('123456')
    })

    const code = await codeRepository.create({
      value: 'A1BC5S',
      codeType: 'password_reset',
      entityId: user.id,
      expiredAt: new Date()
    })

    code.isValid = false

    await codeRepository.update(code)

    await expect(() =>
      sut.execute({ codeValue: code.value, newPassword: 'newpassword' })
    ).rejects.toBeInstanceOf(CodeInvalidError)
  })

  it('should not be able to reset user password if code not found', async () => {
    await expect(() =>
      sut.execute({ codeValue: 'CODENOTFOUND', newPassword: 'newpassword' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to reset user password if code expired', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash: await passwordHash.hash('123456')
    })

    const code = await codeRepository.create({
      value: 'A1BC5S',
      codeType: 'password_reset',
      entityId: user.id,
      expiredAt: new Date()
    })

    vi.setSystemTime(new Date('2026-09-01T10:31:00Z'))

    await expect(() =>
      sut.execute({ codeValue: code.value, newPassword: 'newpassword' })
    ).rejects.toBeInstanceOf(CodeExpiredError)
  })

  it('should not be able to reset user password if user not found', async () => {
    const code = await codeRepository.create({
      value: 'A1BC5S',
      codeType: 'password_reset',
      entityId: 'user-not-found',
      expiredAt: new Date()
    })

    await expect(() =>
      sut.execute({ codeValue: code.value, newPassword: 'newpassword' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
