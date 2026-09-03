import { TokenDriver, UserPayload } from './token.driver.js'

export class MockTokenDriver implements TokenDriver {
  sign(payload: UserPayload) {
    return `token-${payload.sub}`
  }

  verify(token: string) {
    try {
      if (token === '') {
        return null
      }

      return {
        user: {
          sub: token.split('-')[1]
        }
      }
    } catch {
      return null
    }
  }
}
