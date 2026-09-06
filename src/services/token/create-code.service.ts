import { Code, CodeType } from '@/domain/code.entity.js'
import { CodeGenerateDriver } from '@/drivers/code/code-generate.driver.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

const CODE_EXPIRATION_MINUTES: Record<CodeType, number> = {
  user_verification: 15,
  password_reset: 30
}

interface CreateCodeRequest {
  userId: string
  codeType: CodeType
}

interface CreateCodeResponse {
  code: Code
}

export class CreateCodeService {
  constructor(
    private userRepository: UserRepository,
    private codeRepository: CodeRepository,
    private codeGenerate: CodeGenerateDriver
  ) {}

  async execute({
    userId,

    codeType
  }: CreateCodeRequest): Promise<CreateCodeResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    await this.codeRepository.updateAllActiveByEntityId(userId, codeType, {
      isValid: false
    })

    const codeValue = this.codeGenerate.generate()

    const SECONDS_PER_MINUTE = 60
    const MILLISECONDS_PER_SECOND = 1000
    const expirationMinutes = CODE_EXPIRATION_MINUTES[codeType]

    const code = await this.codeRepository.create({
      entityId: userId,
      value: codeValue,
      codeType,
      expiredAt: new Date(
        Date.now() +
          expirationMinutes * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND
      )
    })

    return { code }
  }
}
