import assert from "node:assert/strict"
import { test } from "node:test"

import { formatCurrency } from "../money"

test("formats currency using en-US locale", () => {
  const formatted = formatCurrency(1234.56, "USD", "en-US")
  assert.equal(formatted, "$1,234.56")
})

test("formats currency using provided locale", () => {
  const formatted = formatCurrency(1234.56, "EUR", "de-DE")
  // de-DE locale uses non-breaking space before the currency symbol
  assert.equal(formatted, "1.234,56\u00a0€")
})

test("falls back to raw amount when currency code missing", () => {
  const formatted = formatCurrency(1234.56, "")
  assert.equal(formatted, "1234.56")
})

