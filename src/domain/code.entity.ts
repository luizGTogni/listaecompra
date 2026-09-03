export interface Code {
  id: string
  entityId: string
  value: string
  expiredAt: Date
  isValid: boolean
  createdAt: Date
}

export interface CodeInput {
  entityId: string
  value: string
  expiredAt: Date
}
