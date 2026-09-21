import { HttpError } from './http-error.js'

export class TooManyRequestsError extends HttpError {
  constructor(public retryAfterSeconds: number) {
    super({
      name: 'TooManyRequests',
      statusCode: 429,
      message: `Wait ${retryAfterSeconds}s before requesting a new code.`
    })
  }
}
