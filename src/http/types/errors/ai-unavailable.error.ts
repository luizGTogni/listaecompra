import { HttpError } from './http-error.js'

export class AiUnavailableError extends HttpError {
  constructor() {
    super({
      name: 'AiUnavailable',
      statusCode: 503,
      message: 'The AI assistant is unavailable right now.'
    })
  }
}
