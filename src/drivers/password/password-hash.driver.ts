export interface PasswordHashDriver {
  hash(plain: string): Promise<string>
  verify(plain: string, hashed: string): Promise<boolean>
}
