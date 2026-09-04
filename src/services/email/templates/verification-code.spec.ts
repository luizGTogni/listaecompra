import { verificationCodeTemplate } from './verification-code.template.js'

describe('Verification Code Template', () => {
  it('should be able to create verification code template html', async () => {
    expect(verificationCodeTemplate({ code: 'A125C' })).toContain('A125C')
  })
})
