import { MockPasswordHashDriver } from '@/drivers/password/mock-password-hash.driver.js'
import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { InvalidCredentialsError } from '@/http/types/errors/invalid-credentials.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { SamePasswordError } from '@/http/types/errors/same-password.error.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { ChangePasswordService } from './change-password.service.js'
import { GetUserFoundService } from './get-user-found.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let passwordHasher: PasswordHashDriver
let sut: ChangePasswordService

describe('Change Password Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)
    passwordHasher = new MockPasswordHashDriver()
    sut = new ChangePasswordService(
      getUserFound,
      userRepository,
      passwordHasher
    )
  })

  it('should be able to change user password', async () => {
    const authData = {
      email: 'johndoe@email.com',
      passwordPlain: '12345678'
    }

    const userCreated = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: authData.email,
      passwordHash: await passwordHasher.hash(authData.passwordPlain)
    })

    await sut.execute({
      userId: userCreated.id,
      currentPassword: authData.passwordPlain,
      newPassword: 'newpassword'
    })

    const userUpdated = await userRepository.findById(userCreated.id)

    expect(await passwordHasher.hash(authData.passwordPlain)).not.toEqual(
      userUpdated?.passwordHash
    )
    expect(await passwordHasher.hash('newpassword')).toEqual(
      userUpdated?.passwordHash
    )
  })

  it('should not be able to change user password if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found',
        currentPassword: '12345678',
        newPassword: 'newpassword'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to change user password if wrong password', async () => {
    const authData = {
      email: 'johndoe@email.com',
      passwordPlain: '12345678'
    }

    const userCreated = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: authData.email,
      passwordHash: await passwordHasher.hash(authData.passwordPlain)
    })

    await expect(() =>
      sut.execute({
        userId: userCreated.id,
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword'
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to change the user password if the new password is the same current password.', async () => {
    const authData = {
      email: 'johndoe@email.com',
      passwordPlain: '12345678'
    }

    const userCreated = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: authData.email,
      passwordHash: await passwordHasher.hash(authData.passwordPlain)
    })

    await expect(() =>
      sut.execute({
        userId: userCreated.id,
        currentPassword: authData.passwordPlain,
        newPassword: authData.passwordPlain
      })
    ).rejects.toBeInstanceOf(SamePasswordError)
  })
})
