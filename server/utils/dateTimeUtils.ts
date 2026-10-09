import { format, isValid, parseISO, parse } from 'date-fns'

export const formatInputDate = (value?: string) => value && format(new Date(Date.parse(value)), 'd/L/yyyy')

export const formatDate = (date?: string | Date, fmt = 'd MMMM yyyy') => {
  if (!date) return undefined
  const richDate = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(richDate)) return undefined
  return format(richDate, fmt)
}

export const formatFromInputDate = (date?: string, fmt = 'd MMMM yyyy') => {
  if (!date) return undefined

  return formatDate(parse(date, 'd/M/yyyy', new Date()), fmt)
}

export const inputDate = (plusDays: number = 0, plusMonth: number = 0) => {
  const date = new Date()
  if (plusDays !== 0) date.setDate(date.getDate() + plusDays)
  if (plusMonth !== 0) date.setMonth(date.getMonth() + plusMonth)
  return format(date, 'd/M/yyyy')
}
