import { z } from 'zod'
import { Request, Response } from 'express'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { validateAndTransformCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import ReleaseSchedulerService from '../../../../services/apis/releaseSchedulerService'
import { optionalString } from '../../../../utils/validations/validateString'
import { checkTodayOrFuture, validateTransformDate } from '../../../../utils/validations/validateDatePicker'

export const schemaFactory =
  (releaseSchedulerService: ReleaseSchedulerService) => async (_req: Request, res: Response) => {
    const reasons = await releaseSchedulerService.getReferenceData({ res }, 'release-reason')

    return createSchema({
      confirmedReleaseDate: z.string().transform((val, ctx) => {
        const parsedDate = validateTransformDate(
          checkTodayOrFuture,
          'confirmed release date',
          'Confirmed release date must be today or in the future',
        ).safeParse(val)
        if (parsedDate.success) {
          return parsedDate.data
        }
        parsedDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue } as $ZodSuperRefineIssue))
        return z.NEVER
      }),
      reason: z.string().transform(validateAndTransformCodedDescription(reasons, 'Enter a reason for this release')),
      comments: optionalString({
        maxChar: { count: 250, errorMessage: 'The maximum character limit for comments is 250' },
      }),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
