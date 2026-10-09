import { RequestHandler } from 'express'

export const serviceEnabledMiddleware: RequestHandler = async (_req, res, next) => {
  if (!res.locals.feComponents?.sharedData?.services.find(({ id }) => id === 'release-scheduler')) {
    return res.render('pages/service-not-enabled')
  }
  return next()
}
