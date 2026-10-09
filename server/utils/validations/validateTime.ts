import { z } from 'zod'

export const parseNumber = (value: string, min: number, max: number, length: number) =>
  z
    .string()
    .regex(new RegExp(`^[0-9]{1,${length}}$`))
    .refine(val => {
      const numValue = Number(val)
      return numValue >= min && numValue <= max
    })
    .transform(val => val.padStart(length, '0'))
    .safeParse(value)

export const parseHour = (value: string) => parseNumber(value, 0, 23, 2)

export const parseMinute = (value: string) => parseNumber(value, 0, 59, 2)

export function addEmptyHHMMErrors(
  ctx: z.core.$RefinementCtx,
  segment: 'release' | 'return',
  parsedHour: z.ZodSafeParseResult<string> | undefined,
  parsedMinute: z.ZodSafeParseResult<string> | undefined,
  path: (string | number)[] = [],
) {
  const errorMessage = `Enter a ${segment === 'release' ? 'start' : 'return'} time`
  if (!parsedHour && !parsedMinute) {
    ctx.addIssue({
      code: 'custom',
      message: errorMessage,
      path: [...path, `${segment}Hour`],
    })

    ctx.addIssue({
      code: 'custom',
      message: '',
      path: [...path, `${segment}Minute`],
    })
  } else if (!parsedHour) {
    ctx.addIssue({
      code: 'custom',
      message: errorMessage,
      path: [...path, `${segment}Hour`],
    })
  } else if (!parsedMinute) {
    ctx.addIssue({
      code: 'custom',
      message: errorMessage,
      path: [...path, `${segment}Minute`],
    })
  }
}

export function addInvalidHHMMErrors(
  ctx: z.core.$RefinementCtx,
  segment: 'release' | 'return',
  parsedHour: z.ZodSafeParseResult<string> | undefined,
  parsedMinute: z.ZodSafeParseResult<string> | undefined,
  path: (string | number)[] = [],
) {
  const error = `Enter a valid ${segment === 'release' ? 'start' : 'return'} time`
  if (parsedHour?.error && parsedMinute?.error) {
    ctx.addIssue({
      code: 'custom',
      message: error,
      path: [...path, `${segment}Hour`],
    })
    ctx.addIssue({
      code: 'custom',
      message: '',
      path: [...path, `${segment}Minute`],
    })
  } else if (parsedHour?.error) {
    ctx.addIssue({
      code: 'custom',
      message: error,
      path: [...path, `${segment}Hour`],
    })
  } else if (parsedMinute?.error) {
    ctx.addIssue({
      code: 'custom',
      message: error,
      path: [...path, `${segment}Minute`],
    })
  }
}

export function addBeforeErrors(
  ctx: z.core.$RefinementCtx,
  parsedStartHour: z.ZodSafeParseResult<string>,
  parsedStartMinute: z.ZodSafeParseResult<string>,
  parsedEndHour: z.ZodSafeParseResult<string>,
  parsedEndMinute: z.ZodSafeParseResult<string>,
  path: (string | number)[] = [],
  errorMessage: string = 'Return time must be later than the start time',
) {
  const startTime = Number(parsedStartHour!.data) * 60 + Number(parsedStartMinute!.data)
  const endTime = Number(parsedEndHour!.data) * 60 + Number(parsedEndMinute!.data)

  if (endTime <= startTime) {
    ctx.addIssue({
      code: 'custom',
      message: errorMessage,
      path: [...path, 'returnHour'],
    })
    ctx.addIssue({
      code: 'custom',
      message: '',
      path: [...path, 'returnMinute'],
    })
  }
}
