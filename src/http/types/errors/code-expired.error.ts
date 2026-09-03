import { HttpError } from './http-error.js'

export class CodeExpiredError extends HttpError {
  constructor() {
    super({
      name: 'CodeExpired',
      statusCode: 401,
      message: 'Code expired.'
    })
  }
}
