import { env } from '@/config/env.js'
import { Resend } from 'resend'
import { EmailDriver, SendParams } from './email.driver.js'

export class ResendEmailDriver implements EmailDriver {
  constructor(private resend = new Resend(env.RESEND_API_KEY)) {}

  async send(params: SendParams) {
    await this.resend.emails.send({
      from: env.MAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.body
    })
  }
}
