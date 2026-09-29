import { isValidItemQuantity } from './item-unit.js'

describe('isValidItemQuantity', () => {
  it('accepts whole numbers in any unit', () => {
    expect(isValidItemQuantity(3, 'UNIT')).toBe(true)
    expect(isValidItemQuantity(24, 'CAN')).toBe(true)
    expect(isValidItemQuantity(2, 'KG')).toBe(true)
  })

  it('accepts up to 3 decimals only in weight and volume', () => {
    expect(isValidItemQuantity(1.5, 'KG')).toBe(true)
    expect(isValidItemQuantity(0.75, 'L')).toBe(true)
    expect(isValidItemQuantity(0.001, 'L')).toBe(true)
    expect(isValidItemQuantity(1.2345, 'KG')).toBe(false)
    expect(isValidItemQuantity(1.5, 'BOTTLE')).toBe(false)
    expect(isValidItemQuantity(0.5, 'UNIT')).toBe(false)
  })

  it('rejects zero, negatives and non numbers', () => {
    expect(isValidItemQuantity(0, 'UNIT')).toBe(false)
    expect(isValidItemQuantity(-1, 'KG')).toBe(false)
    expect(isValidItemQuantity(NaN, 'UNIT')).toBe(false)
    expect(isValidItemQuantity(Infinity, 'UNIT')).toBe(false)
  })

  it('rejects quantities above the limit of the unit', () => {
    expect(isValidItemQuantity(99, 'BOTTLE')).toBe(true)
    expect(isValidItemQuantity(100, 'BOTTLE')).toBe(false)
    expect(isValidItemQuantity(500, 'BOTTLE')).toBe(false)
    expect(isValidItemQuantity(20000, 'ML')).toBe(true)
    expect(isValidItemQuantity(20001, 'ML')).toBe(false)
  })
})
