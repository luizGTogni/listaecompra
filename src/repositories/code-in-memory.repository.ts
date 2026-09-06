import { Code, CodeInput, CodeType } from '@/domain/code.entity.js'
import { randomUUID } from 'node:crypto'
import { CodeRepository } from './code.repository.js'

export class InMemoryCodeRepository implements CodeRepository {
  private items: Code[] = []

  async create(data: CodeInput) {
    const code: Code = {
      id: randomUUID(),
      entityId: data.entityId,
      value: data.value,
      codeType: data.codeType,
      expiredAt: data.expiredAt,
      isValid: true,
      createdAt: new Date()
    }

    this.items.push(code)

    return { ...code }
  }

  async update(code: Code) {
    const codeIndex = this.items.findIndex((item) => item.id === code.id)

    this.items[codeIndex] = code

    const codeUpdated = this.items[codeIndex]

    return { ...codeUpdated }
  }

  async updateAllActiveByEntityId(
    entityId: string,
    codeType: CodeType,
    data: { isValid: boolean }
  ) {
    const codesFound = this.items.filter(
      (item) =>
        item.entityId === entityId && item.isValid && item.codeType === codeType
    )
    await Promise.all(
      codesFound.map((c) => {
        c.isValid = data.isValid

        return this.update(c)
      })
    )
  }

  async findById(id: string) {
    const code = this.items.find((item) => item.id === id)

    if (!code) {
      return null
    }

    return { ...code }
  }

  async findAllActiveByEntityId(entityId: string, codeType: CodeType) {
    const codesFound = this.items.filter(
      (item) =>
        item.entityId === entityId && item.isValid && item.codeType === codeType
    )

    return codesFound
  }

  async findByValueAndEntityId(
    value: string,
    entityId: string,
    codeType: CodeType
  ) {
    const code = this.items.find(
      (item) =>
        item.entityId === entityId &&
        item.value == value &&
        item.codeType === codeType
    )

    if (!code) {
      return null
    }

    return { ...code }
  }

  async findByValue(value: string, codeType: CodeType) {
    const code = this.items.find(
      (item) => item.value === value && item.codeType === codeType
    )

    return code ? { ...code } : null
  }
}

export const inMemoryCodeRepository = new InMemoryCodeRepository()
