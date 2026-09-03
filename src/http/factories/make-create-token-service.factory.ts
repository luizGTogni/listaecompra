import { JwtTokenDriver } from '@/drivers/auth/jwt-token.driver.js'
import { CreateTokenService } from '@/services/token/create-token.service.js'

export function makeCreateTokenService() {
  const tokenDriver = new JwtTokenDriver()
  return new CreateTokenService(tokenDriver)
}
