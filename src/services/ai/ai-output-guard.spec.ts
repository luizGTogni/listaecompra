import {
  AI_ITEM_QUANTITY_MAX,
  guardItems,
  isExcessiveAiQuantity,
  isValidItemTitle,
  normalizeAiQuantity,
  parseAiUnit
} from './ai-output-guard.js'
import { ITEM_QUANTITY_MAX, ITEM_UNITS } from '@/domain/item-unit.js'

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

describe('AI unit and quantity', () => {
  it.each([
    ['bottle', 'BOTTLE'],
    [' KG ', 'KG'],
    ['barril', 'UNIT'],
    [undefined, 'UNIT'],
    [3, 'UNIT']
  ])('reads the unit %j as %s', (unit, expected) => {
    expect(parseAiUnit(unit)).toBe(expected)
  })

  it('rounds whole units and keeps 3 decimals in weight and volume', () => {
    expect(normalizeAiQuantity(2.6, 'BOTTLE')).toBe(3)
    expect(normalizeAiQuantity(0.4, 'UNIT')).toBe(1)
    expect(normalizeAiQuantity(1.23456, 'KG')).toBe(1.235)
    expect(normalizeAiQuantity(0.75, 'L')).toBe(0.75)
    expect(normalizeAiQuantity(0.0001, 'L')).toBe(0.001)
  })

  it.each([0, -3, NaN, Infinity])('turns %s into 1', (quantity) => {
    expect(normalizeAiQuantity(quantity, 'UNIT')).toBe(1)
    expect(normalizeAiQuantity(quantity, 'KG')).toBe(1)
  })

  it('flags what is above the limit of the unit', () => {
    expect(isExcessiveAiQuantity(60, 'BOTTLE')).toBe(false)
    expect(isExcessiveAiQuantity(61, 'BOTTLE')).toBe(true)
    expect(isExcessiveAiQuantity(500, 'BOTTLE')).toBe(true)
    expect(isExcessiveAiQuantity(2, 'L')).toBe(false)
  })

  it('never allows the model more than a person is allowed', () => {
    for (const unit of ITEM_UNITS) {
      expect(AI_ITEM_QUANTITY_MAX[unit]).toBeLessThanOrEqual(
        ITEM_QUANTITY_MAX[unit]
      )
    }
  })
})
