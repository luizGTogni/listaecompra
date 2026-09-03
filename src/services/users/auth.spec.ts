import { MockPasswordHashDriver } from '@/drivers/password/mock-password-hash.driver.js'
import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { InvalidCredentialsError } from '@/http/types/errors/invalid-credentials.error.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { AuthService } from './auth.service.js'

let userRepository: UserRepository
let passwordHasher: PasswordHashDriver
let sut: AuthService

describe('Auth Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    passwordHasher = new MockPasswordHashDriver()
    sut = new AuthService(userRepository, passwordHasher)
  })

  it('should be able to auth user in session', async () => {
    const authData = {
      email: 'johndoe@email.com',
      passwordPlain: '123456'
    }

    let userCreated = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: authData.email,
      passwordHash: await passwordHasher.hash(authData.passwordPlain)
    })

    userCreated = await userRepository.update({
      ...userCreated,
      verifiedAt: new Date()
    })

    const { user } = await sut.execute({
      email: authData.email,
      passwordPlain: authData.passwordPlain
    })

    expect(user).toEqual(userCreated)
  })

  it('should not be able to auth user in session with password wrong', async () => {
    const authData = {
      email: 'johndoe@email.com',
      passwordPlain: '123456'
    }

    await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: authData.email,
      passwordHash: await passwordHasher.hash(authData.passwordPlain)
    })

    await expect(() =>
      sut.execute({
        email: authData.email,
        passwordPlain: 'password-wrong'
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to auth user in session with email wrong', async () => {
    const authData = {
      email: 'johndoe@email.com',
      passwordPlain: '123456'
    }

    await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: authData.email,
      passwordHash: await passwordHasher.hash(authData.passwordPlain)
    })

    await expect(() =>
      sut.execute({
        email: 'emailwrong@email.com',
        passwordPlain: authData.passwordPlain
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
