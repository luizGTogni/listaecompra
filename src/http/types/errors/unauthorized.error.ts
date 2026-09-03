import { HttpError } from './http-error.js'

export class UnauthorizedError extends HttpError {
  constructor() {
    super({
      name: 'Unauthorized',
      statusCode: 401,
      message: 'Unauthorized.'
    })
  }
}
