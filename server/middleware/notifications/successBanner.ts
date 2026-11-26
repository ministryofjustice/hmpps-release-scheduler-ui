import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { FLASH_KEY__SUCCESS_BANNER } from '../../utils/constants'

export type SuccessBanner = { heading?: string; text?: string }

export const successBannerMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  req.flashSuccessBanner = (banner: SuccessBanner) => req.flash(FLASH_KEY__SUCCESS_BANNER, JSON.stringify(banner))
  if (req.method === 'GET') {
    const successBanner = req.flash(FLASH_KEY__SUCCESS_BANNER)
    if (successBanner?.[0]) {
      try {
        res.locals.successBanner = JSON.parse(successBanner[0]) as SuccessBanner
      } catch {
        res.locals.successBanner = undefined
      }
    }
  }
  next()
}
