import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { optionalString } from '../../../../utils/validations/validateString'

export const schema = createSchema({
  confirm: z
    .enum(['YES', 'NO'], { message: 'Select if you want to cancel this release' })
    .transform(val => val === 'YES'),
  reason: optionalString(),
})

export type SchemaType = z.infer<typeof schema>
