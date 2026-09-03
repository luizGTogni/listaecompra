import { CodeGenerateDriver } from './code-generate.driver.js'
import { RandomCodeGenerateDriver } from './random-code-generate.driver.js'

let sut: CodeGenerateDriver

describe('Random Code Generate', () => {
  beforeAll(() => {
    sut = new RandomCodeGenerateDriver()
  })

  it('should be able to generate code with 6 char', () => {
    const code = sut.generate()

    expect(code).toEqual(expect.any(String))
    expect(code.length).toEqual(6)
  })

  it('should be able to generate two code differents', () => {
    const code = sut.generate()
    const code2 = sut.generate()

    expect(code).not.toEqual(code2)
  })
})
