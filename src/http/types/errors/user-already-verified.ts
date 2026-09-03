import { HttpError } from './http-error.js'

export class UserAlreadyVerifiedError extends HttpError {
  constructor() {
    super({
      name: 'UserAlreadyVerified',
      statusCode: 409,
      message: 'User already verified.'
    })
  }
}
