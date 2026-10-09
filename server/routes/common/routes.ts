import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Page } from '../../services/auditService'
import { populateAuditPageName } from '../../middleware/audit/populateAuditPageName'

type Handler<T, ResBody, ReqBody, Q> = RequestHandler<T, ResBody, ReqBody, Q> | RequestHandler<T, ResBody, ReqBody, Q>[]

export const BaseRouter = () => {
  const router = Router({ mergeParams: true })

  const get = <T, ResBody, ReqBody, Q>(
    path: string,
    pageOrHandler: Handler<T, ResBody, ReqBody, Q> | Page,
    ...otherHandlers: Handler<T, ResBody, ReqBody, Q>[]
  ) => {
    const firstHandler = typeof pageOrHandler === 'string' ? populateAuditPageName(pageOrHandler) : pageOrHandler
    const handlers = [firstHandler, ...otherHandlers].flatMap(itm => itm)
    return router.get(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))
  }

  const post = <T, ResBody, ReqBody, Q>(path: string, ...handlers: Handler<T, ResBody, ReqBody, Q>[]) => {
    const flattenedHandlers = handlers.flatMap(itm => itm)
    return router.post(path, ...flattenedHandlers.slice(0, -1), asyncMiddleware(flattenedHandlers.slice(-1)[0]!))
  }

  return {
    router,
    get,
    post,
  }
}
