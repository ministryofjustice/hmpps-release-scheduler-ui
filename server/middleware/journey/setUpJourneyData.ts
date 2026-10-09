import { NextFunction, Request, Response } from 'express'
import { JourneyData } from '../../@types/journeys'
import CacheInterface from '../../data/cache/cacheInterface'

export default function setUpJourneyData(store: CacheInterface<JourneyData>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const journeyId = req.params['journeyId'] ?? 'default'
    const key = `${req.user?.username}.${journeyId}`

    const cached = await store.get(key)
    req.journeyData = cached ??
      req.journeyData ?? { instanceUnixEpoch: Date.now(), stateGuard: process.env.NODE_ENV !== 'e2e-test' }
    res.prependOnceListener('close', async () => {
      await store.set(key, req.journeyData, 20 * 60 * 60)
    })
    next()
  }
}
