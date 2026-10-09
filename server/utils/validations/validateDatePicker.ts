import { z } from 'zod'
import { isValid, parseISO, startOfDay, isBefore, isAfter } from 'date-fns'
import { addArticle } from '../formatUtils'

export const validateDateBase = (dateName: string) => {
  return z
    .string({ message: `Enter or select ${addArticle(dateName)}` })
    .min(1, { message: `Enter or select ${addArticle(dateName)}` })
    .transform(value => value.split(/[-/]/).reverse())
    .transform((value, ctx) => {
      if (
        value.length !== 3 ||
        !/[0-9]{4}/.test(value[0]!) ||
        !/[0-9]{1,2}/.test(value[1]!) ||
        !/[0-9]{1,2}/.test(value[2]!)
      ) {
        ctx.addIssue({ code: 'custom', message: `Enter the ${dateName} in the correct format, for example, 17/5/2024` })
        return z.NEVER
      }
      // Prefix month and date with a 0 if needed
      const month = value[1]?.length === 2 ? value[1] : `0${value[1]}`
      const date = value[2]?.length === 2 ? value[2] : `0${value[2]}`
      return `${value[0]}-${month}-${date}T00:00:00Z` // We put a full timestamp on it so it gets parsed as UTC time and the date doesn't get changed due to locale
    })
    .transform(date => parseISO(date))
    .check(ctx => {
      if (!isValid(ctx.value)) {
        ctx.issues.push({ code: 'custom', message: `Enter a real date for the ${dateName}`, input: ctx.value })
      }
    })
}

type DateChecker = (date: Date) => boolean

export const validateTransformDate = (
  checker: DateChecker | null,
  dateName: string,
  checkFailErrorMsg: string = '',
) => {
  return validateDateBase(dateName)
    .check(ctx => {
      if (checker && !checker(ctx.value)) {
        ctx.issues.push({ code: 'custom', message: checkFailErrorMsg, input: ctx.value })
      }
    })
    .transform(date => date.toISOString().substring(0, 10))
}

export const validateTransformOptionalDate = (dateName: string) =>
  z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (!val) return null
      if (!val.length) return null

      const date = parseISO(
        `${val
          .split('/')
          .reverse()
          .map(part => part.padStart(2, '0'))
          .join('-')}T00:00:00Z`,
      )
      if (!isValid(date)) {
        ctx.issues.push({
          code: 'custom',
          message: `Enter the ${dateName} in the correct format, for example, 17/5/2024`,
          input: ctx.value,
        })
        return z.NEVER
      }
      return date.toISOString().substring(0, 10)
    })

export const getMinDateChecker = (minDate: Date) => (date: Date) => !isBefore(startOfDay(date), startOfDay(minDate))

export const checkTodayOrFuture = (date: Date) => !isBefore(startOfDay(date), startOfDay(new Date()))

export const getMaxDateChecker = (minDate: Date) => (date: Date) => !isAfter(startOfDay(date), startOfDay(minDate))

export const checkTodayOrPast = (date: Date) => !isAfter(startOfDay(date), startOfDay(new Date()))
