import { z } from 'zod'
import { addDays, differenceInDays, format } from 'date-fns'
import { createSchema } from '../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../utils/validations/validateDatePicker'

const statusEnum = z.enum(['PENDING', 'UNVERIFIED', 'VERIFIED'])

export const schema = createSchema({
  searchTerm: z
    .string()
    .optional()
    .transform(val => val?.replace(/[\r\n]/g, '').trim()),
  start: validateTransformOptionalDate('date from'),
  end: validateTransformOptionalDate('date to'),
  status: z.union([statusEnum.transform(val => [val]), z.array(statusEnum)]).optional(),
  page: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return 1
      const num = Number(val)
      if (!Number.isNaN(num)) return num
      return 1
    }),
}).transform(({ start, end, ...otherProps }, ctx) => {
  if (otherProps.searchTerm) {
    return {
      start: null,
      end: null,
      status: [],
      ...otherProps,
    }
  }

  if (start === null && end === null) {
    return {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 31), 'yyyy-MM-dd'),
      ...otherProps,
    }
  }

  if (start === null) {
    ctx.addIssue({ code: 'custom', message: 'Enter or select date from', path: ['start'] })
  }

  if (end === null) {
    ctx.addIssue({ code: 'custom', message: 'Enter or select date to', path: ['end'] })
  }

  if (start && end) {
    if (start > end) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid date range', path: ['end'] })
      ctx.addIssue({ code: 'custom', message: '', path: ['start'] })
    } else if (differenceInDays(end, start) > 31) {
      ctx.addIssue({ code: 'custom', message: 'Enter a date range less than 31 days', path: ['end'] })
      ctx.addIssue({ code: 'custom', message: '', path: ['start'] })
    }
  }

  if (ctx.issues.length) {
    return z.NEVER
  }

  return {
    start,
    end,
    ...otherProps,
  }
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
