export interface SendParams {
  to: string
  subject: string
  body: string
}

export interface EmailDriver {
  send(params: SendParams): Promise<void>
}
