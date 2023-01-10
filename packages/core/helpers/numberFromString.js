export default function numberFromString(value = '', state = null) {
  //TODO: COVE Refactor - Why is this accepting some 'state' instead of conditionally checking in the calling source? Should not need additional logic.
  // Only do this to values that are ONLY numbers - without this parseFloat strips all the other text
  if (typeof value === 'string' && state?.legend?.type === 'category') return value

  let nonNumeric = /[^\d.-]/g
  if (false === Number.isNaN(parseFloat(value)) && null === String(value).match(nonNumeric)) {
    return parseFloat(value)
  }

  return value
}
