import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { FindOneUserService } from './find-one-user.service.js'
import { GetUserFoundService } from './get-user-found.service.js'

let userRepository: UserRepository
let getUserFound: GetUserFoundService
let sut: FindOneUserService

describe('Find One User Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    getUserFound = new GetUserFoundService(userRepository)

    sut = new FindOneUserService(getUserFound)
  })

  it('should be able to find one user', async () => {
    const dataExpected = {
      name: 'John Doe',
      username: 'JohnDoe',
      email: 'Johndoe@email.com',
      passwordPlain: '123456'
    }

    const userCreated = await userRepository.create({
      ...dataExpected,
      passwordHash: `hashed-${dataExpected.passwordPlain}`
    })

    const { user } = await sut.execute({ userId: userCreated.id })

    expect(user).toEqual(userCreated)
  })

  it('should not be able to find one user if user not found', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-not-found'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
