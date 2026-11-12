import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  verify: z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (val !== 'VERIFY') {
        ctx.addIssue({ code: 'custom', message: 'Check the box to confirm details are correct' })
        return z.NEVER
      }
      return val
    }),
})
