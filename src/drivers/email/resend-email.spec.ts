import { Resend } from 'resend'
import { EmailDriver } from './email.driver.js'
import { ResendEmailDriver } from './resend-email.driver.js'

let sendMock: ReturnType<typeof vi.fn>
let fakeResend: Resend
let sut: EmailDriver

describe('Resend Email Driver', () => {
  beforeEach(() => {
    sendMock = vi
      .fn()
      .mockResolvedValue({ data: { id: 'email-1' }, error: null })
    fakeResend = { emails: { send: sendMock } } as unknown as Resend

    sut = new ResendEmailDriver(fakeResend)
  })

  it('should call Resend API with correct params', async () => {
    await sut.send({
      to: 'user@email.com',
      subject: 'Welcome',
      body: '<p>Hello</p>'
    })

    expect(sendMock).toHaveBeenCalledWith({
      from: expect.any(String),
      to: 'user@email.com',
      subject: 'Welcome',
      html: '<p>Hello</p>'
    })
  })
})
