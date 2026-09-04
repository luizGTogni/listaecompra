import { EmailDriver } from '@/drivers/email/email.driver.js'

interface SendEmailRequest {
  to: string
  subject: string
  body: string
}

export class SendEmailService {
  constructor(private emailDriver: EmailDriver) {}

  async execute(data: SendEmailRequest) {
    await this.emailDriver.send({
      to: data.to,
      subject: data.subject,
      body: data.body
    })
  }
}
