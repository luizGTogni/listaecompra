import { Code, CodeInput } from '@/domain/code.entity.js'

export interface CodeRepository {
  create(data: CodeInput): Promise<Code>
  update(code: Code): Promise<Code>
  updateAllActiveByEntityId(
    entityId: string,
    data: { isValid: boolean }
  ): Promise<void>
  findById(id: string): Promise<Code | null>
  findAllActiveByEntityId(entityId: string): Promise<Code[]>
  findByValueAndEntityId(value: string, entityId: string): Promise<Code | null>
}
