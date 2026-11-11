import { NextFunction, Request, Response } from 'express'
import ReleaseSchedulerService from '../../../../services/apis/releaseSchedulerService'
import { components } from '../../../../@types/releaseSchedulerApi'

export class ScheduleReleasesCheckAnswersController {
  constructor(private readonly releaseSchedulerService: ReleaseSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { release, confirmedReleaseDate, reason, comments } = req.journeyData.scheduleRelease!

    res.render('schedule-a-release/check-answers/view', {
      backUrl: 'details',
      release,
      confirmedReleaseDate,
      reason,
      comments,
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { release, confirmedReleaseDate, reason, comments } = req.journeyData.scheduleRelease!

      const request: components['schemas']['ScheduleRelease'] = {
        type: 'ScheduleRelease',
        confirmedReleaseDate: confirmedReleaseDate!,
        reasonCode: reason!.code,
        comments: comments ?? null,
      }

      req.journeyData.scheduleRelease!.result = await this.releaseSchedulerService.scheduleRelease(
        { res },
        release.id,
        { actions: [request] },
      )
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
