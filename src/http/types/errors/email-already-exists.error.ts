import { HttpError } from './http-error.js'

export class EmailAlreadyExistsError extends HttpError {
  constructor() {
    super({
      name: 'EmailAlreadyExists',
      statusCode: 409,
      message: 'Email already exists.'
    })
  }
}
