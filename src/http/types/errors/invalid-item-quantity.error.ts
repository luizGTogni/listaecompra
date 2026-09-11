import { HttpError } from './http-error.js'

export class InvalidItemQuantityError extends HttpError {
  constructor() {
    super({
      name: 'InvalidItemQuantity',
      statusCode: 400,
      message: 'Invalid item quantity.'
    })
  }
}
