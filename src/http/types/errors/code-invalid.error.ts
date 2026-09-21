import { HttpError } from './http-error.js'

export class CodeInvalidError extends HttpError {
  constructor() {
    super({
      name: 'CodeInvalid',
      statusCode: 400,
      message: 'Code invalid.'
    })
  }
}
