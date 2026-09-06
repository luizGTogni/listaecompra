import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { verificationCodeTemplate } from '../email/templates/verification-code.template.js'
import { CreateCodeService } from '../token/create-code.service.js'

interface ResendCodeRequest {
  userId: string
}

export class ResendCodeService {
  constructor(
    private userRepository: UserRepository,
    private createCodeService: CreateCodeService,
    private sendEmailService: SendEmailService
  ) {}

  async execute({ userId }: ResendCodeRequest): Promise<void> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const { code } = await this.createCodeService.execute({
      userId: user.id,
      codeType: 'user_verification'
    })

    await this.sendEmailService.execute({
      to: user.email,
      subject: 'Lista&Compra - Verification Code',
      body: verificationCodeTemplate({ code: code.value })
    })
  }
}
