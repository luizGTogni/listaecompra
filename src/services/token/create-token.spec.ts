import { MockTokenDriver } from '@/drivers/auth/mock-token.driver.js'
import { TokenDriver } from '@/drivers/auth/token.driver.js'
import { CreateTokenService } from './create-token.service.js'

let tokenDriver: TokenDriver
let sut: CreateTokenService

describe('Create Token Service', () => {
  beforeEach(() => {
    tokenDriver = new MockTokenDriver()
    sut = new CreateTokenService(tokenDriver)
  })

  it('should be able to create token auth', async () => {
    const { token } = await sut.execute({
      user: {
        id: 'id-user',
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@email.com',
        passwordHash: 'hasher-password',
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    expect(token).toEqual(`token-id-user`)
  })
})
