import { PasswordHashDriver } from './password-hash.driver.js'

export class MockPasswordHashDriver implements PasswordHashDriver {
  async hash(plain: string) {
    return `hashed-${plain}`
  }

  async verify(plain: string, hashed: string) {
    return `hashed-${plain}` === hashed
  }
}
