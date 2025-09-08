import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}

export const formatCurrency = (
  amount: number,
  currencyCode: string,
  locale = "en-US"
) => {
  return currencyCode && !isEmpty(currencyCode)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
      }).format(amount)
    : amount.toString()
}
