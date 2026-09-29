import { CodeGenerateDriver } from '@/drivers/code/code-generate.driver.js'
import { RandomCodeGenerateDriver } from '@/drivers/code/random-code-generate.driver.js'
import { InMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { InMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { CreateCodeService } from './create-code.service.js'

let userRepository: UserRepository
let codeRepository: CodeRepository
let codeGenerate: CodeGenerateDriver
let sut: CreateCodeService

describe('Create Code Service', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    codeRepository = new InMemoryCodeRepository()
    codeGenerate = new RandomCodeGenerateDriver()
    sut = new CreateCodeService(userRepository, codeRepository, codeGenerate)
  })

  it('should be able to create code', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      passwordHash: 'hasher-41245'
    })

    const { code } = await sut.execute({
      userId: user.id,
      codeType: 'user_verification'
    })

    const codesDb = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    expect(codesDb.length).toEqual(1)
    expect(codesDb[0].entityId).toEqual(user.id)

    expect(code).toEqual(codesDb[0])
  })

  it('should be able to create second code and delete first code', async () => {
    const user = await userRepository.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      passwordHash: 'hasher-41245'
    })

    const response = await sut.execute({
      userId: user.id,
      codeType: 'user_verification'
    })

    const response2 = await sut.execute({
      userId: user.id,
      codeType: 'user_verification'
    })

    const code1 = await codeRepository.findById(response.code.id)
    const code2 = await codeRepository.findById(response2.code.id)

    expect(code1?.isValid).toBeFalsy()
    expect(code2?.isValid).toBeTruthy()
  })

  it.each([
    { codeType: 'user_verification' as const, minutes: 15 },
    { codeType: 'password_reset' as const, minutes: 30 }
  ])(
    'should expire a $codeType code in $minutes minutes',
    async ({ codeType, minutes }) => {
      const user = await userRepository.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@email.com',
        passwordHash: 'hasher-41245'
      })

      const before = Date.now()
      const { code } = await sut.execute({ userId: user.id, codeType })
      const after = Date.now()

      const expected = minutes * 60 * 1000

      expect(code.expiredAt.getTime()).toBeGreaterThanOrEqual(before + expected)
      expect(code.expiredAt.getTime()).toBeLessThanOrEqual(after + expected)
    }
  )
})
