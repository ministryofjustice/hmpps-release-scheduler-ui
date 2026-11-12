import { NextFunction, Request, Response } from 'express'
import ReleaseSchedulerService from '../../../../services/apis/releaseSchedulerService'

export class VerifyReleaseController {
  constructor(private readonly releaseSchedulerService: ReleaseSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, release } = req.journeyData.updateRelease!

    res.render('releases/verify/view', {
      backUrl,
      release,
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journey = req.journeyData.updateRelease!

      journey.result = (await this.releaseSchedulerService.putRelease({ res }, journey.release.id, {
        actions: [{ type: 'VerifyRelease' }],
      }))!
      journey.updateType = 'verify'
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true
    res.redirect('confirmation')
  }
}
