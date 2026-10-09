import type { NextFunction, Request, Response } from 'express'
import { validate } from 'uuid'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

export type JourneyStateGuard = { [pageName: string]: (req: Request) => string | undefined }

export function isMissingValues<T>(obj: T, keys: Array<keyof T>): boolean {
  return keys.some(key => obj?.[key] === undefined)
}

const recordJourneyGuardFailedEvent = (
  res: Response,
  failReason: 'PRISONER_MISSING' | 'INVALID_STATE',
  flow: string | undefined,
  requestedPage: string | undefined,
  redirectTo: string | undefined,
) => {
  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    return
  }
  telemetry.trackEvent('JourneyStateGuardCheckFailed', {
    failReason,
    username: res.locals.user.displayName,
    ...(res.locals.user.activeCaseLoad?.caseLoadId && {
      activeCaseLoadId: res.locals.user.activeCaseLoad.caseLoadId,
    }),
    ...(flow ? { flow } : {}),
    ...(requestedPage ? { requestedPage } : {}),
    ...(redirectTo ? { redirectTo } : {}),
  })
}

export default function journeyStateGuard(rules: JourneyStateGuard) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const [, uuid, flow, ...remainingPaths] = req.originalUrl.split('/')
    const rawRequestedPage = remainingPaths.join('/')
    const requestedPage = rawRequestedPage!.split('?')[0]!

    if (!uuid || !validate(uuid) || req.originalUrl.endsWith('/start')) {
      // This page does not concern us
      return next()
    }

    if (!req.journeyData?.stateGuard) {
      return next()
    }

    const { journeyData } = req

    // All journeys need journeyData to be populated with prisoner data

    if (!res.locals.prisonerDetails) {
      // The relevant /start for this journey has not been visited
      recordJourneyGuardFailedEvent(res, 'PRISONER_MISSING', flow, requestedPage, '/')
      return res.redirect(`/`)
    }

    if (!requestedPage || !flow) {
      return next()
    }

    let redirectTo
    let latestValidPage = requestedPage.split('?')[0]!

    while (latestValidPage !== null) {
      if (latestValidPage === 'confirmation') {
        if (journeyData?.journeyCompleted) {
          return next()
        }

        latestValidPage = 'check-answers'
        redirectTo = '/check-answers'
      }

      const guardFn = rules[latestValidPage] || rules['*']

      if (guardFn === undefined) {
        // We've backtracked all the way to a page that requires no validation
        if (requestedPage === latestValidPage) {
          return next()
        }
        recordJourneyGuardFailedEvent(res, 'INVALID_STATE', flow, requestedPage, redirectTo)
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }

      const targetRedirect = guardFn({
        ...req,
        journeyData,
        url: redirectTo ? `/${uuid}/${flow}${redirectTo}` : req.originalUrl,
      } as Request)

      if (targetRedirect === undefined) {
        // We passed validation for this page, either redirect if we've had to backtrack or next() if not
        if (requestedPage === latestValidPage) {
          return next()
        }
        recordJourneyGuardFailedEvent(res, 'INVALID_STATE', flow, requestedPage, redirectTo)
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }
      latestValidPage = targetRedirect.startsWith('/') ? targetRedirect.split('/')[1] || '' : targetRedirect
      redirectTo = targetRedirect
    }

    return next()
  }
}
