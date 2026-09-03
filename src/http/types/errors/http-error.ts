interface HttpErrorRequest {
  message: string
  name: string
  statusCode: number
}

export class HttpError extends Error {
  public statusCode: number
  public name: string

  constructor({ message, statusCode, name }: HttpErrorRequest) {
    super(message)
    this.statusCode = statusCode
    this.name = name
  }
}
