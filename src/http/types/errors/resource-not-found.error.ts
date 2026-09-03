import { HttpError } from './http-error.js'

export class ResourceNotFoundError extends HttpError {
  constructor() {
    super({
      name: 'ResourceNotFound',
      statusCode: 404,
      message: 'Resource not found.'
    })
  }
}
