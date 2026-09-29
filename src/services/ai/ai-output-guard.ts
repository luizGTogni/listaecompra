import {
  ITEM_QUANTITY_MAX_DECIMALS,
  ITEM_UNITS,
  isFractionalUnit,
  ItemUnit
} from '@/domain/item-unit.js'

// Guard for what the model returns: it only lets through things that look like
// a shopping list item, whatever the model was told to do.
export const ITEM_TITLE_MIN = 2
export const ITEM_TITLE_MAX = 60
const ITEM_TITLE_MAX_WORDS = 8

const SINGLE_LINE = /^[^\n\r]+$/
const HAS_LETTER = /\p{L}/u
const SUSPICIOUS = /[<>{}[\]`]|https?:\/\/|www\./i

export function isValidItemTitle(title: string) {
  const value = title.trim()

  return (
    value.length >= ITEM_TITLE_MIN &&
    value.length <= ITEM_TITLE_MAX &&
    SINGLE_LINE.test(value) &&
    HAS_LETTER.test(value) &&
    value.split(/\s+/).length <= ITEM_TITLE_MAX_WORDS &&
    !SUSPICIOUS.test(value)
  )
}

// Keeps the valid items. When most of them are invalid the model answered
// something else (a poem, an explanation), so nothing is kept: `null`.
export function guardItems<T extends { title: string }>(items: T[]) {
  const valid = items.filter((item) => isValidItemTitle(item.title))

  if (items.length > 0 && valid.length < items.length / 2) {
    return null
  }

  return valid.map((item) => ({ ...item, title: item.title.trim() }))
}

// Above this the model most likely mixed up units (ml, doses) or ignored the
// size of the event, so the item is left out and the person is told. Tighter
// than what the API accepts from a person, who knows what they are doing.
export const AI_ITEM_QUANTITY_MAX: Record<ItemUnit, number> = {
  UNIT: 50,
  CAN: 100,
  PACK: 30,
  BOX: 20,
  BOTTLE: 60,
  DOZEN: 10,
  KG: 30,
  G: 5000,
  L: 60,
  ML: 10000
}

// The model may write the unit in lower case or make one up: anything that is
// not a known unit is a plain unit.
export function parseAiUnit(unit: unknown): ItemUnit {
  const value = typeof unit === 'string' ? unit.trim().toUpperCase() : ''

  return ITEM_UNITS.find((item) => item === value) ?? 'UNIT'
}

// Whole numbers for what is bought whole, up to 3 decimals for weight and
// volume. Zero, negative or not a number becomes 1.
export function normalizeAiQuantity(quantity: number, unit: ItemUnit) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1
  }

  if (!isFractionalUnit(unit)) {
    return Math.max(1, Math.round(quantity))
  }

  const factor = 10 ** ITEM_QUANTITY_MAX_DECIMALS

  return Math.max(1 / factor, Math.round(quantity * factor) / factor)
}

export function isExcessiveAiQuantity(quantity: number, unit: ItemUnit) {
  return quantity > AI_ITEM_QUANTITY_MAX[unit]
}
