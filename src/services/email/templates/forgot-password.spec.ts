import { forgotPasswordTemplate } from './forgot-password.template.js'

describe('Forgot Password Template', () => {
  it('should be able to create forgot password template html', async () => {
    expect(forgotPasswordTemplate({ code: 'A125C' })).toContain('A125C')
  })
})
