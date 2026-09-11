import { HttpError } from './http-error.js'

export class ShopperListClosedError extends HttpError {
  constructor() {
    super({
      name: 'ShopperListClosed',
      statusCode: 409,
      message: 'The Shopper list already closed.'
    })
  }
}
