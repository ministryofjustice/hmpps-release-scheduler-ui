import { RequestHandler, Request } from 'express'
import { FLASH_KEY__FORM_RESPONSES, FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

export const getValidationErrors = (req: Request) => {
  const validationErrors = req.flash(FLASH_KEY__VALIDATION_ERRORS)[0]
  if (validationErrors) {
    return JSON.parse(validationErrors)
  }
  return null
}

export default function populateValidationErrors(): RequestHandler {
  return async (req, res, next) => {
    res.locals['validationErrors'] = getValidationErrors(req)
    const formResponses = req.flash(FLASH_KEY__FORM_RESPONSES)[0]
    if (formResponses) {
      res.locals.formResponses = JSON.parse(formResponses)
    }
    next()
  }
}
