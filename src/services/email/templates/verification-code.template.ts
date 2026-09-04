interface VerificationCodeTemplateParams {
  code: string
}

export function verificationCodeTemplate({
  code
}: VerificationCodeTemplateParams) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1>Confirme sua conta</h1>
      <p>Use o código abaixo para verificar sua conta. Ele expira em 15 minutos.</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</p>
    </div>
  `
}
