import { HttpError } from './http-error.js'

export class SamePasswordError extends HttpError {
  constructor() {
    super({
      name: 'SamePassword',
      statusCode: 400,
      message: 'New password must be different from your current password.'
    })
  }
}
