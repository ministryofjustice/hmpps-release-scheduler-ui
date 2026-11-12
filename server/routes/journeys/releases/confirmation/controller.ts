import { Request, Response } from 'express'

export class UpdateReleaseConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    const { result, updateType } = req.journeyData.updateRelease!

    res.render('releases/confirmation/view', {
      release: result,
      updateType,
    })
  }
}
