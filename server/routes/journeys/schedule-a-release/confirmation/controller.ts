import { Request, Response } from 'express'

export class ScheduleReleaseConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    const { result, backUrl } = req.journeyData.scheduleRelease!

    res.render('schedule-a-release/confirmation/view', {
      release: result,
      homepageUrl: backUrl,
    })
  }
}
