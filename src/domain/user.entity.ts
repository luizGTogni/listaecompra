export interface User {
  id: string
  name: string
  username: string
  email: string
  passwordHash: string
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UserInput {
  name: string
  username: string
  email: string
  passwordHash: string
}
