import { Request, Response, NextFunction } from 'express'
import AuditService from '../../services/auditService'
import { AuditEvent } from '../../data/hmppsAuditClient'

export const auditApiCallMiddleware =
  (auditService: AuditService) => async (req: Request, res: Response, next: NextFunction) => {
    res.sendApiEvent = async (apiUrl: string, isAttempt: boolean) => {
      const event: AuditEvent = {
        what: isAttempt ? 'API_CALL_ATTEMPT' : 'API_CALL_SUCCESS',
        who: res.locals.user.username,
        correlationId: req.id,
        subjectType: 'NOT_APPLICABLE',
        details: {
          apiUrl,
          activeCaseLoadId: res.locals.user.getActiveCaseloadId(),
        },
      }

      await auditService.logAuditEvent(event)
    }

    next()
  }
