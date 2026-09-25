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
