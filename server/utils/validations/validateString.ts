import { z } from 'zod'

export const optionalString = (options?: { maxChar?: { count: number; errorMessage: string } }) =>
  options?.maxChar
    ? z
        .string()
        .max(options.maxChar.count, { message: options.maxChar.errorMessage })
        .optional()
        .transform(val => (val?.trim().length ? val : null))
    : z
        .string()
        .optional()
        .transform(val => (val?.trim().length ? val : null))
