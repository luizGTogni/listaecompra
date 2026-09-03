import { compare, hash } from 'bcrypt'
import { PasswordHashDriver } from './password-hash.driver.js'

export class BcryptPasswordHashDriver implements PasswordHashDriver {
  private SALT = 12

  async hash(plain: string) {
    return await hash(plain, this.SALT)
  }

  async verify(plain: string, hashed: string) {
    return compare(plain, hashed)
  }
}
