import { prisma } from '@/config/prisma.js'
import { Code, CodeInput, CodeType } from '@/domain/code.entity.js'
import { isUuid } from '@/utils/is-uuid.js'
import { CodeRepository } from './code.repository.js'

export class PrismaCodeRepository implements CodeRepository {
  async create(data: CodeInput) {
    const code = await prisma.code.create({
      data
    })

    return { ...code }
  }

  async update(code: Code) {
    const codeUpdated = await prisma.code.update({
      where: { id: code.id },
      data: code
    })

    return { ...codeUpdated }
  }

  async updateAllActiveByEntityId(
    entityId: string,
    codeType: CodeType,
    data: { isValid: boolean }
  ) {
    await prisma.code.updateMany({
      where: { entityId, codeType, isValid: true },
      data
    })
  }

  async deleteAll() {
    await prisma.code.deleteMany()
  }

  async findById(id: string) {
    if (!isUuid(id)) {
      return null
    }

    const code = await prisma.code.findUnique({ where: { id } })

    return code ? { ...code } : null
  }

  async findAllActiveByEntityId(entityId: string, codeType: CodeType) {
    const codesFound = await prisma.code.findMany({
      where: { entityId, codeType, isValid: true }
    })

    return codesFound
  }

  async findByValueAndEntityId(
    value: string,
    entityId: string,
    codeType: CodeType
  ) {
    const code = await prisma.code.findFirst({
      where: { entityId, codeType, value }
    })

    return code ? { ...code } : null
  }

  async findByValue(value: string, codeType: CodeType) {
    const code = await prisma.code.findFirst({
      where: { codeType, value }
    })

    return code ? { ...code } : null
  }
}
