import { HttpError } from './http-error.js'

export class InvalidCredentialsError extends HttpError {
  constructor() {
    super({
      name: 'InvalidCredentials',
      statusCode: 401,
      message: 'Invalid credentials.'
    })
  }
}
