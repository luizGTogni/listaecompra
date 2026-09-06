export type CodeType = 'user_verification' | 'password_reset'

export interface Code {
  id: string
  entityId: string
  value: string
  codeType: CodeType
  expiredAt: Date
  isValid: boolean
  createdAt: Date
}

export interface CodeInput {
  entityId: string
  value: string
  codeType: CodeType
  expiredAt: Date
}
