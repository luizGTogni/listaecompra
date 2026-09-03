import { BcryptPasswordHashDriver } from './bcrypt-password-hash.driver.js'
import { PasswordHashDriver } from './password-hash.driver.js'

let sut: PasswordHashDriver

describe('Bcrypt Password Hash', () => {
  beforeAll(() => {
    sut = new BcryptPasswordHashDriver()
  })

  it('should be able to hashed password plain', async () => {
    const passwordPlain = '123456'
    const passwordHash = await sut.hash(passwordPlain)

    expect(passwordHash).toEqual(expect.any(String))
  })

  it('should be able to comapare a password plain and password hashed', async () => {
    const passwordPlain = '123456'
    const passwordHash = await sut.hash(passwordPlain)

    const is_combine = await sut.verify(passwordPlain, passwordHash)

    expect(is_combine).toEqual(true)
  })
})
