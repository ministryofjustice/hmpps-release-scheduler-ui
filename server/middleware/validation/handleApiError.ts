import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { FLASH_KEY__FORM_RESPONSES, FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

export const processApiError = (error: HTTPError, req: Request, flashFormResponses: boolean): boolean => {
  try {
    const errorRespData = JSON.parse(error.text) as { userMessage?: string }
    const errorMessage = errorRespData!.userMessage!
    if (errorMessage) {
      req.flash(
        FLASH_KEY__VALIDATION_ERRORS,
        JSON.stringify({
          apiError: [errorMessage],
        }),
      )
      if (flashFormResponses) req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify(req.body))
      return true
    }
    return false
  } catch {
    return false
  }
}

export const handleApiError = (error: HTTPError, req: Request, res: Response, next: NextFunction) => {
  if (processApiError(error, req, true)) {
    res.redirect(req.get('Referrer') ?? (req.method === 'GET' ? '/' : req.originalUrl))
  } else {
    next(error)
  }
}
