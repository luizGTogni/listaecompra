interface ForgotPasswordTemplateParams {
  code: string
}

export function forgotPasswordTemplate({ code }: ForgotPasswordTemplateParams) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1>Esqueceu a sua senha?</h1>
      <p>Use o código abaixo para resetar sua senha. Ele expira em 30 minutos.</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</p>
    </div>
  `
}
