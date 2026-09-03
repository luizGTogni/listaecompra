import { HttpError } from './http-error.js'

export class CodeInvalidError extends HttpError {
  constructor() {
    super({
      name: 'CodeInvalid',
      statusCode: 401,
      message: 'Code invalid.'
    })
  }
}
