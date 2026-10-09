import { Request, Response, NextFunction } from 'express'

export default function sanitiseUrl(req: Request, res: Response, next: NextFunction) {
  if (
    req.originalUrl.length > 2048 &&
    !req.originalUrl.match(
      /^\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/inject-journey-data/,
    )
  )
    throw new Error(`Invalid url with length ${req.originalUrl.length}`)

  // remove trailing slash before query string, such as /add-any-alert/?alertType=D
  if (req.originalUrl.match(/\/\?/) && !req.url.startsWith('/?')) {
    return res.redirect(req.originalUrl.replace(/\/\?/g, '?'))
  }

  // remove trailing slash, except when the trailing slash is part of a query string instead of the path, such as /add-any-alert?description=some/
  if (req.originalUrl.slice(-1) === '/' && req.originalUrl.length > 1 && !/\?[^]*\//.test(req.originalUrl)) {
    return res.redirect(req.originalUrl.slice(0, -1))
  }

  return next()
}
