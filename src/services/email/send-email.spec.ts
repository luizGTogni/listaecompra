import { MockEmailDriver } from '@/drivers/email/mock-email.driver.js'
import { SendEmailService } from './send-email.service.js'

let emailDriver: MockEmailDriver
let sut: SendEmailService

describe('Send Email Service', () => {
  beforeEach(() => {
    emailDriver = new MockEmailDriver()
    sut = new SendEmailService(emailDriver)
  })

  it('should be able to send email', async () => {
    const dataSend = {
      to: 'to@email.com',
      subject: 'email test',
      body: '<h1>test</h1>'
    }

    await sut.execute(dataSend)

    expect(emailDriver.emails).toHaveLength(1)
    expect(emailDriver.emails[0]).toEqual({
      ...dataSend,
      from: 'from@test.com'
    })
  })
})
