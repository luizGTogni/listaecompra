import { HttpError } from './http-error.js'

export class UserNotVerifiedError extends HttpError {
  constructor() {
    super({
      name: 'UserNotVerified',
      statusCode: 403,
      message: 'Invalid not verified.'
    })
  }
}
