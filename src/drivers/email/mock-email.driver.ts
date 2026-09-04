import { EmailDriver, SendParams } from './email.driver.js'

interface Email {
  from: string
  to: string
  subject: string
  body: string
}

export class MockEmailDriver implements EmailDriver {
  public emails: Email[] = []

  async send(params: SendParams) {
    this.emails.push({
      from: 'from@test.com',
      to: params.to,
      subject: params.subject,
      body: params.body
    })
  }
}
