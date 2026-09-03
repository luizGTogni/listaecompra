import { Code } from '@/domain/code.entity.js'
import { CodeGenerateDriver } from '@/drivers/code/code-generate.driver.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface CreateCodeRequest {
  userId: string
}

interface CreateCodeResponse {
  code: Code
}

export class CreateCodeService {
  private readonly EXPIRATION_MINUTES = 15

  constructor(
    private userRepository: UserRepository,
    private codeRepository: CodeRepository,
    private codeGenerate: CodeGenerateDriver
  ) {}

  async execute({ userId }: CreateCodeRequest): Promise<CreateCodeResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    await this.codeRepository.updateAllActiveByEntityId(userId, {
      isValid: false
    })

    const codeValue = this.codeGenerate.generate()

    const SECONDS_PER_MINUTE = 60
    const MILLISECONDS_PER_SECOND = 1000

    const code = await this.codeRepository.create({
      entityId: userId,
      value: codeValue,
      expiredAt: new Date(
        Date.now() +
          this.EXPIRATION_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND
      )
    })

    return { code }
  }
}
