import { JwtTokenDriver } from './jwt-token.driver.js'
import { TokenDriver } from './token.driver.js'

let sut: TokenDriver

describe('JWT Token Driver', () => {
  beforeEach(() => {
    sut = new JwtTokenDriver()
  })

  it('should be able to generate token', () => {
    const token = sut.sign({ sub: 'sub-test' })

    expect(token).toEqual(expect.any(String))
  })

  it('should be able to verify token', () => {
    const token = sut.sign({ sub: 'sub-test' })

    const payload = sut.verify(token)

    expect(payload).toEqual({
      user: {
        sub: 'sub-test'
      }
    })
  })
})
