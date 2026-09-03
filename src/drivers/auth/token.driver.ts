export interface UserPayload {
  sub: string
}

export interface TokenPayload {
  user: UserPayload
}

export interface TokenDriver {
  sign(payload: UserPayload): string
  verify(token: string): TokenPayload | null
}
