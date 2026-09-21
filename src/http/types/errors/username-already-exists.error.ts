import { HttpError } from './http-error.js'

export class UsernameAlreadyExistsError extends HttpError {
  constructor() {
    super({
      name: 'UsernameAlreadyExists',
      statusCode: 409,
      message: 'Username already exists.'
    })
  }
}
