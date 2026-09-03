import { env } from '@/config/env.js'
import jwt from 'jsonwebtoken'
import { TokenDriver, UserPayload } from './token.driver.js'

export class JwtTokenDriver implements TokenDriver {
  sign(payload: UserPayload) {
    return jwt.sign({ user: payload }, env.JWT_SECRET, { expiresIn: '7d' })
  }

  verify(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET)

      if (typeof decoded === 'string') {
        return null
      }

      return {
        user: {
          sub: decoded.user.sub
        }
      }
    } catch {
      return null
    }
  }
}
