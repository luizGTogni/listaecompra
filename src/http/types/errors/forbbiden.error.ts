import { HttpError } from './http-error.js'

export class ForbbidenError extends HttpError {
  constructor() {
    super({
      name: 'Forbbiden',
      statusCode: 403,
      message: 'You do not have permission to this action.'
    })
  }
}
