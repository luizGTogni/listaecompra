import { HttpError } from './http-error.js'

export class ShopperItemAlreadyPurchasedError extends HttpError {
  constructor() {
    super({
      name: 'ShopperItemAlreadyPurchased',
      statusCode: 400,
      message: 'Shopper item already purchased.'
    })
  }
}
