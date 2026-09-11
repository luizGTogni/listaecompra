import { Code, CodeInput, CodeType } from '@/domain/code.entity.js'

export interface CodeRepository {
  create(data: CodeInput): Promise<Code>
  update(code: Code): Promise<Code>
  updateAllActiveByEntityId(
    entityId: string,
    codeType: CodeType,
    data: { isValid: boolean }
  ): Promise<void>
  deleteAll(): Promise<void>
  findById(id: string): Promise<Code | null>
  findAllActiveByEntityId(entityId: string, codeType: CodeType): Promise<Code[]>
  findByValue(value: string, codeType: CodeType): Promise<Code | null>
  findByValueAndEntityId(
    value: string,
    entityId: string,
    codeType: CodeType
  ): Promise<Code | null>
}
