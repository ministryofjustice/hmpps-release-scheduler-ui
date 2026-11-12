import { NextFunction, Request, Response } from 'express'
import ReleaseSchedulerService from '../../../../services/apis/releaseSchedulerService'
import { SchemaType } from './schema'

export class UnscheduleReleaseController {
  constructor(private readonly releaseSchedulerService: ReleaseSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl } = req.journeyData.updateRelease!

    res.render('releases/unschedule/view', {
      backUrl,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateRelease!

    if (!req.body.confirm) {
      res.redirect(journey.backUrl)
      return
    }

    try {
      journey.result = (await this.releaseSchedulerService.putRelease({ res }, journey.release.id, {
        actions: [{ type: 'UnscheduleRelease' }],
        reason: req.body.reason,
      }))!
      journey.updateType = 'unschedule'

      req.journeyData.journeyCompleted = true
      res.redirect('confirmation')
    } catch (e) {
      next(e)
    }
  }
}
