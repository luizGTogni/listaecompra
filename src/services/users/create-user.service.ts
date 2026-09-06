import { User } from '@/domain/user.entity.js'
import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { ResourceAlreadyExistsError } from '@/http/types/errors/resource-already-exists.error.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { SendEmailService } from '../email/send-email.service.js'
import { verificationCodeTemplate } from '../email/templates/verification-code.template.js'
import { CreateCodeService } from '../token/create-code.service.js'

interface CreateUserRequest {
  name: string
  username: string
  email: string
  passwordPlain: string
}

interface CreateUserResponse {
  user: User
}

export class CreateUserService {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHashDriver,
    private createCodeService: CreateCodeService,
    private sendEmailService: SendEmailService
  ) {}

  async execute({
    email,
    name,
    passwordPlain,
    username
  }: CreateUserRequest): Promise<CreateUserResponse> {
    let userAlreadyExists = await this.userRepository.findByEmail(email)

    if (userAlreadyExists) {
      throw new ResourceAlreadyExistsError()
    }

    userAlreadyExists = await this.userRepository.findByUsername(username)

    if (userAlreadyExists) {
      throw new ResourceAlreadyExistsError()
    }

    const passwordHash = await this.passwordHasher.hash(passwordPlain)

    const user = await this.userRepository.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash
    })

    const { code } = await this.createCodeService.execute({
      userId: user.id,
      codeType: 'user_verification'
    })

    await this.sendEmailService.execute({
      to: user.email,
      subject: 'Lista&Compra - Verification Code',
      body: verificationCodeTemplate({ code: code.value })
    })

    return { user }
  }
}
