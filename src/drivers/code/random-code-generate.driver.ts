import { randomInt } from 'node:crypto'
import { CodeGenerateDriver } from './code-generate.driver.js'

export class RandomCodeGenerateDriver implements CodeGenerateDriver {
  private readonly CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  private readonly LENGTH = 6

  generate(): string {
    let code = ''

    for (let i = 0; i < this.LENGTH; i++) {
      code += this.CHARSET[randomInt(this.CHARSET.length)]
    }

    return code
  }
}
