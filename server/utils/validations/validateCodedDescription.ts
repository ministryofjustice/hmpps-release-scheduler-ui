import { RefinementCtx, z } from 'zod'
import { CodedDescription } from '../../@types/journeys'

export const validateAndTransformCodedDescription =
  (refData: CodedDescription[] | null, errorMessage: string) => (val: string, ctx: RefinementCtx) => {
    if (!refData) throw new Error('Reference data unavailable')

    const result = refData.find(({ code }) => code === val)
    if (!result) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
      })
      return z.NEVER
    }
    return result
  }
export const validateAndTransformOptionalCodedDescription =
  (refData: CodedDescription[] | null, errorMessage: string) => (val: string | undefined, ctx: RefinementCtx) => {
    if (!val) return null
    return validateAndTransformCodedDescription(refData, errorMessage)(val, ctx)
  }
