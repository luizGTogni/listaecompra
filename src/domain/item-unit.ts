export const ITEM_UNITS = [
  'UNIT',
  'KG',
  'G',
  'L',
  'ML',
  'PACK',
  'BOX',
  'BOTTLE',
  'CAN',
  'DOZEN'
] as const

export type ItemUnit = (typeof ITEM_UNITS)[number]

// Only weight and volume can be fractional (1.5 kg, 0.75 L). The rest is
// bought whole: nobody buys 2.5 bottles.
const FRACTIONAL_UNITS: ItemUnit[] = ['KG', 'G', 'L', 'ML']

export function isFractionalUnit(unit: ItemUnit) {
  return FRACTIONAL_UNITS.includes(unit)
}

export const ITEM_QUANTITY_MAX_DECIMALS = 3

export const ITEM_QUANTITY_MAX: Record<ItemUnit, number> = {
  UNIT: 999,
  CAN: 999,
  PACK: 99,
  BOX: 99,
  BOTTLE: 99,
  DOZEN: 99,
  KG: 100,
  G: 10000,
  L: 200,
  ML: 20000
}

export function isValidItemQuantity(quantity: number, unit: ItemUnit) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return false
  }

  if (quantity > ITEM_QUANTITY_MAX[unit]) {
    return false
  }

  if (!isFractionalUnit(unit)) {
    return Number.isInteger(quantity)
  }

  const factor = 10 ** ITEM_QUANTITY_MAX_DECIMALS

  return Math.abs(Math.round(quantity * factor) - quantity * factor) < 1e-6
}
