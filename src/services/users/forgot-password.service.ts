import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { forgotPasswordTemplate } from '../email/templates/forgot-password.template.js'
import { CreateCodeService } from '../token/create-code.service.js'

interface ForgotPasswordRequest {
  email: string
}

export class ForgotPasswordService {
  constructor(
    private userRepository: UserRepository,
    private createCodeService: CreateCodeService,
    private sendEmailService: SendEmailService
  ) {}

  async execute({ email }: ForgotPasswordRequest): Promise<void> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const { code } = await this.createCodeService.execute({
      userId: user.id,
      codeType: 'password_reset'
    })

    await this.sendEmailService.execute({
      to: user.email,
      subject: 'Lista&Compra - Reset Password',
      body: forgotPasswordTemplate({ code: code.value })
    })
  }
}
