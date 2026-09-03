import { HttpError } from './http-error.js'

export class ResourceAlreadyExistsError extends HttpError {
  constructor() {
    super({
      name: 'ResourceAlreadyExists',
      statusCode: 409,
      message: 'Resource already exists.'
    })
  }
}
