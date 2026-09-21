import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { TooManyRequestsError } from '@/http/types/errors/too-many-requests.error.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { verificationCodeTemplate } from '../email/templates/verification-code.template.js'
import { CreateCodeService } from '../token/create-code.service.js'
import { GetUserFoundService } from './get-user-found.service.js'

interface ResendCodeRequest {
  userId: string
}

export class ResendCodeService {
  private COOLDOWN_SECONDS = 60

  constructor(
    private getUserFound: GetUserFoundService,
    private codeRepository: CodeRepository,
    private createCodeService: CreateCodeService,
    private sendEmailService: SendEmailService
  ) {}

  async execute({ userId }: ResendCodeRequest): Promise<void> {
    const user = await this.getUserFound.execute({ userId })

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const [codeLast] = (
      await this.codeRepository.findAllActiveByEntityId(
        user.id,
        'user_verification'
      )
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (codeLast) {
      const elapsed = (Date.now() - codeLast.createdAt.getTime()) / 1000

      if (elapsed < this.COOLDOWN_SECONDS) {
        throw new TooManyRequestsError(
          Math.ceil(this.COOLDOWN_SECONDS - elapsed)
        )
      }
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
