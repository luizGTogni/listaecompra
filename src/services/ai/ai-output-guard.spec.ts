import { guardItems, isValidItemTitle } from './ai-output-guard.js'

describe('AI output guard', () => {
  it.each(['Cenoura', 'Farinha de trigo', 'Leite (litro)', ' Ovos '])(
    'accepts "%s" as an item',
    (title) => {
      expect(isValidItemTitle(title)).toBe(true)
    }
  )

  it.each([
    ['empty', '  '],
    ['one character', 'a'],
    ['no letters', '---'],
    ['only numbers', '12345'],
    ['a line break', 'Cenoura\nOvos'],
    ['too long', 'a'.repeat(61)],
    ['too many words', 'um dois tres quatro cinco seis sete oito nove'],
    ['html', '<script>alert(1)</script>'],
    ['code', 'const x = { a: 1 }'],
    ['a link', 'https://exemplo.com']
  ])('rejects an item with %s', (_, title) => {
    expect(isValidItemTitle(title)).toBe(false)
  })

  it('keeps the valid items and drops the few invalid ones', () => {
    const result = guardItems([
      { title: ' Cenoura ', quantity: 3 },
      { title: 'Ovos', quantity: 4 },
      { title: '<b>x</b>', quantity: 1 }
    ])

    expect(result).toEqual([
      { title: 'Cenoura', quantity: 3 },
      { title: 'Ovos', quantity: 4 }
    ])
  })

  it('discards everything when most items are invalid', () => {
    expect(
      guardItems([
        { title: 'Era uma vez um reino muito distante de tudo isso aqui' },
        { title: 'Rimas\ne versos' },
        { title: 'Cenoura' }
      ])
    ).toBeNull()
  })

  it('accepts an empty list', () => {
    expect(guardItems([])).toEqual([])
  })
})
