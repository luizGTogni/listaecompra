import { env } from '@/config/env.js'
import { EmailDriver } from '@/drivers/email/email.driver.js'
import { MockEmailDriver } from '@/drivers/email/mock-email.driver.js'
import { ResendEmailDriver } from '@/drivers/email/resend-email.driver.js'

export function makeEmailDriver(): EmailDriver {
  return env.NODE_ENV === 'test'
    ? new MockEmailDriver()
    : new ResendEmailDriver()
}
